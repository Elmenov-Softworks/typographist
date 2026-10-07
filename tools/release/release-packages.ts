import { existsSync, mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { runCommand } from './command.util.ts';
import { projects } from './release.constants.ts';

export const buildPackages = (version: string) => {
  for (const project of projects) {
    rmSync(`packages/${project}/dist`, { recursive: true, force: true });
  }

  console.log(
    runCommand('npx', ['nx', 'run-many', '-t', 'build', '--projects', projects.join(','), '--skip-nx-cache']),
  );

  return projects.map((project) => {
    const directory = `packages/${project}`;
    const manifest: unknown = JSON.parse(readFileSync(`${directory}/package.json`, 'utf8'));

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

    if (
      project !== 'typographist' &&
      project !== 'rules-transformer' &&
      (!('dependencies' in manifest) ||
        typeof manifest.dependencies !== 'object' ||
        manifest.dependencies === null ||
        !('@elmenov-softworks/typographist' in manifest.dependencies) ||
        manifest.dependencies['@elmenov-softworks/typographist'] !== version)
    ) {
      throw new Error(`Internal dependency does not match ${version} in ${project}.`);
    }

    const temporary = mkdtempSync(join(tmpdir(), 'typographist-pack-'));

    try {
      const packed: unknown = JSON.parse(
        runCommand('npm', ['pack', `./${directory}`, '--json', '--pack-destination', temporary]),
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
