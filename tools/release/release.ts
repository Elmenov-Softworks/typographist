import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';

import { ReleaseClient, releaseChangelog, releaseVersion } from 'nx/release';

import { runCommand, runGit } from './command.util.ts';
import { buildPackages } from './release-packages.ts';
import { parseRecord, parseRequest } from './release-record.util.ts';
import { findUnpublishedProjects } from './release-registry.ts';
import { chooseAction, needsLatestRun } from './release-state.util.ts';
import { projects } from './release.constants.ts';
import type { ReleaseRecord } from './release.types.ts';

const recordPath = '.release/latest.json';
const requestPath = '.release/request.json';

const publishRecord = async (record: ReleaseRecord, missing: string[]) => {
  const tagCommit = runGit('rev-parse', `v${record.version}^{commit}`);
  const taggedRecord = parseRecord(JSON.parse(runGit('show', `${tagCommit}:${recordPath}`)));

  if (
    JSON.stringify(taggedRecord) !== JSON.stringify(record) ||
    runGit('rev-parse', `${tagCommit}^`) !== record.source
  ) {
    throw new Error('Release tag, source parent, and durable record disagree.');
  }

  runGit('switch', '--detach', tagCommit);
  console.log(runCommand('npm', ['ci']));

  const built = buildPackages(record.version);

  if (JSON.stringify(built) !== JSON.stringify(record.packages))
    throw new Error('Rebuilt artifacts differ from the recorded release.');

  for (const project of missing) {
    const publisher = new ReleaseClient({
      groups: { libraries: { projects: [project], projectsRelationship: 'fixed' } },
    });
    const result = await publisher.releasePublish({ access: 'public', firstRelease: true });

    if (result[project]?.code !== 0)
      throw new Error(`Publication failed for ${project}; rerun to resume this version.`);
  }

  const remaining = await findUnpublishedProjects(record);

  if (remaining.length > 0) throw new Error(`Release ${record.version} is incomplete: ${remaining.join(', ')}.`);

  console.log(`Confirmed all packages published at ${record.version}.`);
};

const main = async () => {
  if (
    process.env.GITHUB_ACTIONS !== 'true' ||
    process.env.GITHUB_REPOSITORY !== 'Elmenov-Softworks/typographist' ||
    process.env.GITHUB_EVENT_NAME !== 'push' ||
    process.env.GITHUB_REF !== 'refs/heads/master' ||
    process.env.RELEASE_CHECKS_PASSED !== 'true'
  ) {
    throw new Error('Releases run only in the approved master push job after successful checks.');
  }

  const source = process.env.GITHUB_SHA;

  if (source === undefined) throw new Error('Missing checked source commit.');

  runGit('fetch', 'origin', 'master', '--tags');
  const remoteHead = runGit('rev-parse', 'origin/master');
  const remoteFiles = runGit('ls-tree', '-r', '--name-only', 'origin/master').split('\n');
  const previous = remoteFiles.includes(recordPath)
    ? parseRecord(JSON.parse(runGit('show', `origin/master:${recordPath}`)))
    : null;
  const releaseCommit = previous === null ? null : runGit('rev-parse', `v${previous.version}^{commit}`);

  if (previous !== null && releaseCommit !== null) {
    const tagged = parseRecord(JSON.parse(runGit('show', `${releaseCommit}:${recordPath}`)));

    if (
      JSON.stringify(tagged) !== JSON.stringify(previous) ||
      runGit('rev-parse', `${releaseCommit}^`) !== previous.source
    ) {
      throw new Error('Previous release tag and durable record disagree.');
    }
  }

  const missing = previous === null ? [] : await findUnpublishedProjects(previous);
  const action = chooseAction({ checksPassed: true, source, remoteHead, releaseCommit, missing });

  if (action === 'resume' && previous !== null) {
    await publishRecord(previous, missing);

    if (releaseCommit !== null && needsLatestRun(source, releaseCommit, previous.source))
      throw new Error('Older release resumed. Rerun the latest master workflow to release its checked source.');

    return;
  }

  if (action !== 'prepare') {
    console.log(`Release decision: ${action}.`);

    return;
  }

  if (runGit('rev-parse', 'HEAD') !== source || runGit('status', '--porcelain') !== '')
    throw new Error('Release requires a clean checked source snapshot.');

  const request = existsSync(requestPath) ? parseRequest(JSON.parse(readFileSync(requestPath, 'utf8'))) : null;
  const firstRelease = previous === null;
  const versioned = await releaseVersion({
    specifier: firstRelease ? '0.1.0' : (request ?? 'patch'),
    firstRelease,
    stageChanges: false,
    gitCommit: false,
    gitTag: false,
    gitPush: false,
  });
  const version = versioned.workspaceVersion;

  if (typeof version !== 'string') throw new Error('Nx did not choose one fixed release version.');

  await releaseChangelog({
    version,
    versionData: versioned.projectsVersionData,
    releaseGraph: versioned.releaseGraph,
    firstRelease,
    to: source,
    stageChanges: false,
    gitCommit: false,
    gitTag: false,
    gitPush: false,
    createRelease: false,
  });

  console.log(
    runCommand('npx', [
      'prettier',
      '--write',
      ...projects.flatMap((project) => [`packages/${project}/package.json`, `packages/${project}/CHANGELOG.md`]),
    ]),
  );

  const record: ReleaseRecord = {
    source,
    previousVersion: previous?.version ?? null,
    version,
    request,
    packages: buildPackages(version),
  };

  await findUnpublishedProjects(record);
  rmSync(requestPath, { force: true });
  mkdirSync('.release', { recursive: true });
  writeFileSync(recordPath, `${JSON.stringify(record, null, 2)}\n`);
  console.log(runCommand('npx', ['prettier', recordPath, '--write']));

  const intendedFiles = [
    recordPath,
    'package-lock.json',
    ...projects.flatMap((project) => [`packages/${project}/package.json`, `packages/${project}/CHANGELOG.md`]),
  ];

  if (request !== null) intendedFiles.push(requestPath);

  runGit('add', '--', ...intendedFiles);
  const changed = runGit('diff', '--name-only').split('\n').filter(Boolean);

  if (changed.length > 0) throw new Error(`Nx changed unexpected files: ${changed.join(', ')}.`);

  runGit('config', 'user.name', 'github-actions[bot]');
  runGit('config', 'user.email', '41898282+github-actions[bot]@users.noreply.github.com');
  runGit('commit', '-m', `chore(release): ${version}`);
  runGit('tag', `v${version}`);
  runGit('push', '--atomic', 'origin', 'HEAD:refs/heads/master', `refs/tags/v${version}`);

  await publishRecord(record, await findUnpublishedProjects(record));
};

await main();
