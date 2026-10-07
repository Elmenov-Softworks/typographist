import { execFileSync } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';
import { cpus, platform, release } from 'node:os';
import { dirname, resolve } from 'node:path';
import { parseArgs } from 'node:util';

import type { BenchmarkReport } from './benchmark.types.ts';
import { currentImplementations, loadLegacyImplementation } from './implementations.factory.ts';
import { measureImplementation, sampleCount, warmupIterations } from './measurement.util.ts';
import { renderReport } from './render-report.util.ts';
import { createWorkloads } from './workloads.constants.ts';

try {
  const { values } = parseArgs({
    options: {
      output: { type: 'string', default: 'tools/benchmarks/results/latest' },
      legacy: { type: 'string' },
      'legacy-commit': { type: 'string' },
      help: { type: 'boolean', short: 'h' },
    },
  });

  if (values.help) {
    console.log(
      'Usage: node tools/benchmarks/hyphenation.ts [--output <path-prefix>] [--legacy <old-dist/index.js>] [--legacy-commit <sha>]',
    );
  } else {
    if (
      values['legacy-commit'] !== undefined &&
      (values.legacy === undefined || !/^[a-f0-9]{40}$/u.test(values['legacy-commit']))
    ) {
      throw new TypeError('--legacy-commit requires --legacy and a full commit SHA');
    }

    const implementationCommit = execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
    const workingTreeDirty = execFileSync('git', ['status', '--porcelain'], { encoding: 'utf8' }).trim() !== '';
    const workloads = createWorkloads();
    const legacy = values.legacy === undefined ? null : await loadLegacyImplementation(values.legacy);
    const implementations = legacy === null ? currentImplementations : [legacy, ...currentImplementations];
    const reference = legacy === null ? null : legacy.create();
    const report: BenchmarkReport = {
      implementationCommit,
      workingTreeDirty,
      legacyModule: values.legacy === undefined ? null : resolve(values.legacy),
      legacyCommit: values['legacy-commit'] ?? null,
      createdAt: new Date().toISOString(),
      node: process.version,
      icu: process.versions.icu ?? null,
      os: `${platform()} ${release()}`,
      cpu: cpus()[0]?.model ?? null,
      sampleCount,
      warmupIterations,
      implementations: implementations.map((implementation) => {
        console.error(`Measuring ${implementation.id} (${implementation.algorithm})`);

        return measureImplementation(implementation, workloads, reference);
      }),
    };
    const prefix = resolve(values.output);

    await mkdir(dirname(prefix), { recursive: true });
    await writeFile(`${prefix}.json`, JSON.stringify(report, null, 2) + '\n');
    await writeFile(`${prefix}.html`, renderReport(report));
    console.log(`${prefix}.json\n${prefix}.html`);
  }
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
}
