import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { cpus, platform, release } from 'node:os';
import { dirname, resolve } from 'node:path';
import { parseArgs } from 'node:util';

import type { BenchmarkReport, ImplementationResult } from './benchmark.types.ts';
import { loadExternalImplementations } from './external-adapters.factory.ts';
import { measureExternal } from './external-measurement.util.ts';
import { sampleCount, warmupIterations } from './measurement.util.ts';
import { renderReport } from './render-report.util.ts';
import { readSavedReport } from './saved-report.util.ts';
import { createWorkloads } from './workloads.constants.ts';

try {
  const { values } = parseArgs({
    options: {
      modules: { type: 'string' },
      input: { type: 'string' },
      output: { type: 'string' },
    },
  });

  if (values.modules === undefined || values.input === undefined || values.output === undefined) {
    throw new TypeError(
      'Usage: node tools/benchmarks/compare-libraries.ts --modules <node_modules> --input <saved.json> --output <prefix>',
    );
  }

  const source = await readFile(values.input, 'utf8');
  const previous = readSavedReport(source);
  const os = `${platform()} ${release()}`;
  const cpu = cpus()[0]?.model ?? null;
  assert.equal(previous.node, process.version, 'Run with the same Node version as the saved report');
  assert.equal(previous.icu, process.versions.icu ?? null);
  assert.equal(previous.os, os);
  assert.equal(previous.cpu, cpu);
  assert.equal(previous.sampleCount, sampleCount);
  assert.equal(previous.warmupIterations, warmupIterations);
  const workloads = createWorkloads();

  for (const implementation of previous.implementations) {
    assert.equal(implementation.processing.length, workloads.length);
    for (const workload of workloads) {
      const existing = implementation.processing.find(
        ({ name, locale }) => name === workload.name && locale === workload.locale,
      );
      assert.equal(
        existing?.inputSha256,
        createHash('sha256').update(workload.text).digest('hex'),
        'Saved workload input differs',
      );
    }
  }

  const externalComparison = {
    createdAt: new Date().toISOString(),
    node: process.version,
    icu: process.versions.icu ?? null,
    os,
    cpu,
    implementationCommit: execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(),
    workingTreeDirty: execFileSync('git', ['status', '--porcelain'], { encoding: 'utf8' }).trim() !== '',
    sourceReportSha256: createHash('sha256').update(source).digest('hex'),
  };
  const additions: ImplementationResult[] = [];

  for (const implementation of await loadExternalImplementations(values.modules)) {
    console.error(`Measuring ${implementation.id}@${implementation.version}`);
    additions.push(await measureExternal(implementation, workloads));
  }

  const report: BenchmarkReport = {
    ...previous,
    externalComparison,
    implementations: [...previous.implementations, ...additions],
  };
  const prefix = resolve(values.output);
  await mkdir(dirname(prefix), { recursive: true });
  await writeFile(`${prefix}.json`, JSON.stringify(report, null, 2) + '\n');
  await writeFile(`${prefix}.html`, renderReport(report));
  console.log(`${prefix}.json\n${prefix}.html`);
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
}
