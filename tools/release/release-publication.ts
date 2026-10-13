import { ReleaseClient } from 'nx/release';

import { runCommand, runGit } from './command.util.ts';
import { buildPackages } from './release-packages.ts';
import { parseRecord } from './release-record.util.ts';
import type { ReleaseRecord } from './release.types.ts';

export const publishRecord = async (record: ReleaseRecord, missing: string[]) => {
  const tagCommit = runGit('rev-parse', `v${record.version}^{commit}`);
  const taggedRecord = parseRecord(JSON.parse(runGit('show', `${tagCommit}:.release/latest.json`)));

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

  console.log(`Publication accepted for ${record.version}: ${missing.join(', ')}.`);
  console.log('npm validation may still be pending. Registry integrity will be checked on subsequent runs.');
};
