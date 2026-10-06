import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { ReleaseClient, releaseChangelog, releaseVersion } from 'nx/release';

import {
  chooseAction,
  needsLatestRun,
  parseRecord,
  parseRequest,
  projects,
  readRegistryIntegrity,
} from './release-state.ts';
import type { ReleaseRecord } from './release.types.ts';

const run = (command: string, args: string[]) =>
  execFileSync(command, args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'inherit'] }).trim();
const git = (...args: string[]) => run('git', args);
const readJson = (path: string) => {
  const value: unknown = JSON.parse(readFileSync(path, 'utf8'));
  return value;
};
const recordPath = '.release/latest.json';
const requestPath = '.release/request.json';

const probe = async (record: ReleaseRecord) => {
  const missing: string[] = [];

  for (const pkg of record.packages) {
    const response = await fetch(`https://registry.npmjs.org/${encodeURIComponent(pkg.name)}/${record.version}`);
    const body: unknown = response.status === 200 ? await response.json() : null;
    const integrity = readRegistryIntegrity(response.status, body);

    if (integrity === null) {
      missing.push(pkg.project);
    } else if (integrity !== pkg.integrity) {
      throw new Error(`Registry integrity differs for ${pkg.name}@${record.version}.`);
    }
  }

  return missing;
};

const buildPackages = (version: string) => {
  for (const project of projects) rmSync(`packages/${project}/dist`, { recursive: true, force: true });
  console.log(run('npx', ['nx', 'run-many', '-t', 'build', '--projects', projects.join(','), '--skip-nx-cache']));

  return projects.map((project) => {
    const directory = `packages/${project}`;
    const manifest = readJson(`${directory}/package.json`);

    if (
      typeof manifest !== 'object' ||
      manifest === null ||
      !('name' in manifest) ||
      manifest.name !== `@elmenov-softworks/${project}` ||
      !('version' in manifest) ||
      manifest.version !== version ||
      ('private' in manifest && manifest.private === true)
    ) {
      throw new Error(`Incorrect publication manifest for ${project}.`);
    }

    for (const entry of ['index.js', 'index.d.ts']) {
      if (!existsSync(`${directory}/dist/${entry}`)) throw new Error(`Missing ${project}/dist/${entry}.`);
    }

    if (project !== 'typographist') {
      if (
        !('dependencies' in manifest) ||
        typeof manifest.dependencies !== 'object' ||
        manifest.dependencies === null ||
        !('@elmenov-softworks/typographist' in manifest.dependencies) ||
        manifest.dependencies['@elmenov-softworks/typographist'] !== version
      ) {
        throw new Error(`Internal dependency does not match ${version} in ${project}.`);
      }
    }

    const temporary = mkdtempSync(join(tmpdir(), 'typographist-pack-'));

    try {
      const packed: unknown = JSON.parse(
        run('npm', ['pack', `./${directory}`, '--json', '--pack-destination', temporary]),
      );
      if (!Array.isArray(packed)) throw new Error('Invalid npm pack result.');
      const item: unknown = packed[0];
      if (typeof item !== 'object' || item === null || !('integrity' in item) || typeof item.integrity !== 'string') {
        throw new Error('npm pack omitted integrity.');
      }

      return { project, name: manifest.name, integrity: item.integrity };
    } finally {
      rmSync(temporary, { recursive: true, force: true });
    }
  });
};

const publishRecord = async (record: ReleaseRecord, missing: string[]) => {
  const tagCommit = git('rev-parse', `v${record.version}^{commit}`);
  const taggedRecord = parseRecord(JSON.parse(git('show', `${tagCommit}:${recordPath}`)));
  if (JSON.stringify(taggedRecord) !== JSON.stringify(record) || git('rev-parse', `${tagCommit}^`) !== record.source) {
    throw new Error('Release tag, source parent, and durable record disagree.');
  }

  git('switch', '--detach', tagCommit);
  console.log(run('npm', ['ci']));
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

  const remaining = await probe(record);
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
  git('fetch', 'origin', 'master', '--tags');
  const remoteHead = git('rev-parse', 'origin/master');
  const remoteFiles = git('ls-tree', '-r', '--name-only', 'origin/master').split('\n');
  const previous = remoteFiles.includes(recordPath)
    ? parseRecord(JSON.parse(git('show', `origin/master:${recordPath}`)))
    : null;
  const releaseCommit = previous === null ? null : git('rev-parse', `v${previous.version}^{commit}`);
  if (previous !== null && releaseCommit !== null) {
    const tagged = parseRecord(JSON.parse(git('show', `${releaseCommit}:${recordPath}`)));
    if (
      JSON.stringify(tagged) !== JSON.stringify(previous) ||
      git('rev-parse', `${releaseCommit}^`) !== previous.source
    ) {
      throw new Error('Previous release tag and durable record disagree.');
    }
  }
  const missing = previous === null ? [] : await probe(previous);
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

  if (git('rev-parse', 'HEAD') !== source || git('status', '--porcelain') !== '')
    throw new Error('Release requires a clean checked source snapshot.');
  const request = existsSync(requestPath) ? parseRequest(readJson(requestPath)) : null;
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
    run('npx', [
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
  await probe(record);
  rmSync(requestPath, { force: true });
  mkdirSync('.release', { recursive: true });
  writeFileSync(recordPath, `${JSON.stringify(record, null, 2)}\n`);
  console.log(run('npx', ['prettier', recordPath, '--write']));
  const intendedFiles = [
    recordPath,
    'package-lock.json',
    ...projects.flatMap((project) => [`packages/${project}/package.json`, `packages/${project}/CHANGELOG.md`]),
  ];
  if (request !== null) intendedFiles.push(requestPath);
  git('add', '--', ...intendedFiles);
  const changed = git('diff', '--name-only').split('\n').filter(Boolean);
  if (changed.length > 0) throw new Error(`Nx changed unexpected files: ${changed.join(', ')}.`);
  git('config', 'user.name', 'github-actions[bot]');
  git('config', 'user.email', '41898282+github-actions[bot]@users.noreply.github.com');
  git('commit', '-m', `chore(release): ${version}`);
  git('tag', `v${version}`);
  git('push', '--atomic', 'origin', 'HEAD:refs/heads/master', `refs/tags/v${version}`);
  await publishRecord(record, await probe(record));
};

await main();
