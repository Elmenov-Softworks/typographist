import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import { cpus, platform, release } from 'node:os';
import { dirname, resolve } from 'node:path';
import { performance } from 'node:perf_hooks';
import { parseArgs } from 'node:util';

import { Typographist } from '../../packages/typographist/dist/index.js';
import type { ExternalImplementation, TextFormatter } from './benchmark.types.ts';
import type {
  CacheComparisonReport,
  CacheImplementationResult,
  CacheProcessingResult,
  CacheState,
} from './cache-comparison.types.ts';
import { loadExternalImplementations } from './external-adapters.factory.ts';
import { validateExternalOutput } from './external-measurement.util.ts';
import { sampleCount, summarize, warmupIterations } from './measurement.util.ts';
import { renderCacheReport } from './render-cache-report.util.ts';
import { createWorkloads } from './workloads.constants.ts';

type Profile = {
  id: string;
  label: string;
  library: string;
  algorithm: string;
  useFast: boolean | null;
  cacheState: CacheState;
  cacheSizeMiB: number | null;
  version?: string;
  notes: string;
  prepare: ExternalImplementation['prepare'];
};

const { values } = parseArgs({
  options: {
    modules: { type: 'string' },
    output: { type: 'string', default: '/tmp/typographist-benchmarks/cache-comparison' },
  },
});
if (values.modules === undefined) throw new Error('--modules must identify the external node_modules directory');

const profiles: Profile[] = [false, true].flatMap((useFast) => {
  const algorithm = useFast ? 'khristov' : 'knuth-liang';

  return (['disabled', 'empty', 'warmed'] as const).map((cacheState) => ({
    id: `${algorithm}-${cacheState}`,
    label: `${useFast ? 'Khristov' : 'Knuth–Liang'} · ${cacheState}`,
    library: 'typographist',
    algorithm,
    useFast,
    cacheState,
    cacheSizeMiB: cacheState === 'disabled' ? 0 : 64,
    notes: 'Exact-source word cache shared across locales; 64 MiB estimated budget, or zero to disable.',
    prepare: () => () => {
      const instance = new Typographist({ useFast, cacheSize: cacheState === 'disabled' ? 0 : 64 });
      return (text, locale) => instance.format(text, locale);
    },
  }));
});
for (const implementation of await loadExternalImplementations(values.modules)) {
  for (const cacheState of ['empty', 'warmed'] as const) {
    profiles.push({
      ...implementation,
      id: `${implementation.id}-${cacheState}`,
      label: `${implementation.id} ${implementation.version} · ${cacheState}`,
      library: implementation.id,
      useFast: null,
      cacheState,
      cacheSizeMiB: null,
      notes:
        implementation.notes +
        ' Each timed sample uses a fresh instance. Hypher has no persistent cache; its warmed profile means a repeated call.',
    });
  }
}

const sourceCommit = execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
const dirty = execFileSync('git', ['status', '--porcelain'], { encoding: 'utf8' }).trim() !== '';
const workloads = createWorkloads();
const references = new Map<boolean, TextFormatter>();
for (const useFast of [false, true]) {
  const instance = new Typographist({ useFast, cacheSize: 0 });
  references.set(useFast, (text, locale) => instance.format(text, locale));
}
const implementations: CacheImplementationResult[] = [];

for (const profile of profiles) {
  console.error(`Measuring ${profile.label}`);
  const processing: CacheProcessingResult[] = [];
  const skippedWorkloads: { name: string; locale: 'en' | 'ru'; reason: string }[] = [];
  const allPreparation: number[] = [];
  let consumedLength = 0;

  for (const workload of workloads) {
    const preparation: number[] = [];
    const cacheWarmup: number[] = [];
    const formatting: number[] = [];
    const reference = profile.useFast === null ? null : references.get(profile.useFast);
    const expected = reference === null || reference === undefined ? null : reference(workload.text, workload.locale);
    let firstOutput: string | null = null;
    let checked: ReturnType<typeof validateExternalOutput> | null = null;

    try {
      for (let sample = 0; sample < sampleCount + warmupIterations; sample += 1) {
        const create = await profile.prepare();
        const preparationStart = performance.now();
        const format = create();
        const preparationMs = performance.now() - preparationStart;
        let warmupMs = 0;

        if (profile.cacheState === 'warmed') {
          const warmupStart = performance.now();
          const warmed = format(workload.text, workload.locale);
          warmupMs = performance.now() - warmupStart;
          consumedLength += warmed.length;
          if (expected !== null) assert.equal(warmed, expected);
        }

        const start = performance.now();
        const output = format(workload.text, workload.locale);
        const elapsed = performance.now() - start;
        consumedLength += output.length;
        if (expected !== null) assert.equal(output, expected);
        if (firstOutput === null) {
          firstOutput = output;
          checked = validateExternalOutput(format, output, workload);
          if (profile.useFast !== null) {
            assert.ok(checked.sourcePreserved && checked.idempotent && checked.graphemeSafe === true);
          }
        } else {
          assert.equal(output, firstOutput);
        }

        if (sample >= warmupIterations) {
          preparation.push(preparationMs);
          cacheWarmup.push(warmupMs);
          formatting.push(elapsed);
        }
      }
    } catch (error) {
      if (profile.useFast !== null || error instanceof assert.AssertionError) throw error;
      skippedWorkloads.push({
        name: workload.name,
        locale: workload.locale,
        reason: error instanceof Error ? error.message : String(error),
      });
      continue;
    }

    if (firstOutput === null || checked === null) throw new Error('Missing measured output');
    const timing = summarize(formatting);
    allPreparation.push(...preparation);
    processing.push({
      ...timing,
      name: workload.name,
      locale: workload.locale,
      inputUtf16: workload.text.length,
      inputSha256: createHash('sha256').update(workload.text).digest('hex'),
      outputUtf16: firstOutput.length,
      iterations: 1,
      millionUtf16PerSecond: workload.text.length / timing.medianMs / 1000,
      validation: checked,
      preparation: summarize(preparation),
      cacheWarmup: summarize(cacheWarmup),
      outputEqual: expected === null ? null : true,
    });
  }

  implementations.push({
    ...profile,
    preparation: summarize(allPreparation),
    processing,
    skippedWorkloads,
    consumedLength,
  });
}

const report: CacheComparisonReport = {
  implementationCommit: sourceCommit,
  workingTreeDirty: dirty,
  legacyModule: null,
  legacyCommit: null,
  createdAt: new Date().toISOString(),
  node: process.version,
  icu: process.versions.icu ?? null,
  os: `${platform()} ${release()}`,
  cpu: cpus()[0]?.model ?? null,
  sampleCount,
  warmupIterations,
  procedure:
    'Each sample uses a fresh instance with both locales. Module/pattern loading is excluded. Preparation and one cache-populating call for warmed profiles are recorded separately. Exactly one whole-text call is timed. Empty profiles can reuse words within that first call. Three preliminary samples are discarded and seven measured samples retained. Output validation runs after timing. Profiles run sequentially in a fixed order; timing noise remains possible. External dictionaries and text protection differ; validation is not linguistic accuracy. Built-in external caches retain their native policy; Hypher has no persistent cache. Estimated cache budgets are not measured heap usage.',
  implementations,
};
const prefix = resolve(values.output);
await mkdir(dirname(prefix), { recursive: true });
await writeFile(`${prefix}.json`, JSON.stringify(report, null, 2) + '\n');
await writeFile(`${prefix}.html`, renderCacheReport(report));
console.log(`${prefix}.json\n${prefix}.html`);
