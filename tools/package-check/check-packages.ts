import { execFileSync } from 'node:child_process';
import { copyFileSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { projects } from '../release/release.constants.ts';

const root = fileURLToPath(new URL('../../', import.meta.url));
const directory = mkdtempSync(join(tmpdir(), 'typographist-consumer-'));
const npm = (args: string[], cwd = directory) =>
  execFileSync('npm', args, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'inherit'] });
const installedVersion = (name: string) => {
  const manifest: unknown = JSON.parse(readFileSync(join(root, 'node_modules', name, 'package.json'), 'utf8'));

  if (
    typeof manifest !== 'object' ||
    manifest === null ||
    !('version' in manifest) ||
    typeof manifest.version !== 'string'
  ) {
    throw new Error(`Missing installed version for ${name}`);
  }

  return manifest.version;
};

try {
  const dependencies: Record<string, string> = {};

  for (const project of projects) {
    const packed: unknown = JSON.parse(
      npm(['pack', `./packages/${project}`, '--json', '--pack-destination', directory], root),
    );

    if (!Array.isArray(packed)) throw new Error(`Invalid pack result for ${project}`);
    const item: unknown = packed[0];

    if (typeof item !== 'object' || item === null || !('filename' in item) || typeof item.filename !== 'string') {
      throw new Error(`Missing archive for ${project}`);
    }

    dependencies[`@elmenov-softworks/${project}`] = `file:${join(directory, item.filename)}`;
  }

  for (const name of [
    'react',
    'react-dom',
    '@types/react',
    '@types/react-dom',
    'vue',
    '@vue/server-renderer',
    'solid-js',
    'vite',
    'typescript',
    '@types/node',
  ]) {
    dependencies[name] = installedVersion(name);
  }

  writeFileSync(join(directory, 'package.json'), JSON.stringify({ private: true, type: 'module', dependencies }));
  writeFileSync(
    join(directory, 'tsconfig.json'),
    JSON.stringify({
      compilerOptions: {
        target: 'ES2022',
        module: 'NodeNext',
        moduleResolution: 'NodeNext',
        strict: true,
        types: ['node', 'react'],
        skipLibCheck: false,
        outDir: 'dist',
      },
      include: ['consumer.ts', 'browser.ts'],
    }),
  );
  copyFileSync(fileURLToPath(new URL('./fixtures/consumer.ts', import.meta.url)), join(directory, 'consumer.ts'));
  copyFileSync(fileURLToPath(new URL('./fixtures/browser.ts', import.meta.url)), join(directory, 'browser.ts'));
  writeFileSync(
    join(directory, 'vite.config.ts'),
    `export default { build: { lib: { entry: 'browser.ts', formats: ['es'], fileName: 'browser' }, outDir: 'browser-dist' } };`,
  );

  console.log(npm(['install', '--ignore-scripts', '--no-audit', '--no-fund']));
  execFileSync(
    process.execPath,
    [join(directory, 'node_modules/typescript/bin/tsc'), '-p', join(directory, 'tsconfig.json')],
    { cwd: directory, stdio: 'inherit' },
  );
  execFileSync(process.execPath, [join(directory, 'dist/consumer.js')], { cwd: directory, stdio: 'inherit' });
  execFileSync(process.execPath, [join(directory, 'node_modules/vite/bin/vite.js'), 'build'], {
    cwd: directory,
    stdio: 'inherit',
  });
  execFileSync(join(directory, 'node_modules/.bin/transform-rules'), ['--help'], { cwd: directory, stdio: 'inherit' });
  console.log(
    'All five npm archives passed isolated installation, declarations, ESM, SSR and browser bundling checks.',
  );
} finally {
  rmSync(directory, { recursive: true, force: true });
}
