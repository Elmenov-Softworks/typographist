import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import { cpus, platform, release } from 'node:os';
import { dirname, resolve } from 'node:path';
import { performance } from 'node:perf_hooks';
import { parseArgs } from 'node:util';

import { Typographist } from '@elmenov-softworks/typographist';
import type { FormattingCategory } from '@elmenov-softworks/typographist';

import { sampleCount, summarize, warmupIterations } from '../measurement.util.ts';
import { createTypographyWorkloads } from './workloads.factory.ts';

const { values } = parseArgs({
  options: {
    output: { type: 'string', default: '/tmp/typographist-benchmarks/typography.json' },
    'source-commit': { type: 'string' },
    'working-tree': { type: 'string' },
  },
});
if (values['source-commit'] !== undefined && !/^[a-f0-9]{40}$/.test(values['source-commit'])) {
  throw new TypeError('--source-commit must be a full commit SHA');
}
if (values['working-tree'] !== undefined && !['clean', 'dirty'].includes(values['working-tree'])) {
  throw new TypeError('--working-tree must be clean or dirty');
}
const profiles: { name: string; categories: readonly FormattingCategory[] }[] = [
  { name: 'disabled', categories: [] },
  { name: 'hyphenation', categories: ['hyphenation'] },
  { name: 'quotes', categories: ['quotes'] },
  { name: 'nonbreaking-spacing', categories: ['nonbreakingSpacing'] },
  { name: 'symbolic', categories: ['quotes', 'dashes', 'punctuation', 'spacing', 'nonbreakingSpacing'] },
  { name: 'all', categories: ['quotes', 'dashes', 'punctuation', 'spacing', 'nonbreakingSpacing', 'hyphenation'] },
];
const workloads = createTypographyWorkloads();
const lexicalContent = (text: string) => (text.match(/[\p{L}\p{M}\p{N}]/gu) ?? []).join('');
const iterations = 5;
let consumedLength = 0;
const results = [];

for (const profile of profiles) {
  for (const useFast of [false, true]) {
    for (const cacheSize of [0, 64]) {
      console.error(`Measuring ${profile.name}, useFast=${String(useFast)}, cacheSize=${String(cacheSize)}`);
      const preparation: number[] = [];

      for (let sample = 0; sample < sampleCount + warmupIterations; sample += 1) {
        const start = performance.now();
        const instance = new Typographist({ categories: profile.categories, useFast, cacheSize });
        const elapsed = performance.now() - start;
        consumedLength += instance.format('table', 'en').length;

        if (sample >= warmupIterations) preparation.push(elapsed);
      }

      const instance = new Typographist({ categories: profile.categories, useFast, cacheSize });
      const reference = new Typographist({ categories: profile.categories, useFast, cacheSize: 0 });
      const processing = workloads.map((workload) => {
        const { text, locale } = workload;
        const expected = reference.format(text, locale);
        assert.equal(lexicalContent(expected), lexicalContent(text));
        if (profile.categories.length === 0) assert.equal(expected, text);
        const heapBefore = process.memoryUsage().heapUsed;
        const firstStart = performance.now();
        const first = instance.format(text, locale);
        const firstCallMs = performance.now() - firstStart;
        assert.equal(first, expected);

        for (let warmup = 0; warmup < warmupIterations; warmup += 1) {
          consumedLength += instance.format(text, locale).length;
        }

        const samples: number[] = [];

        for (let sample = 0; sample < sampleCount; sample += 1) {
          const start = performance.now();
          let output = '';

          for (let iteration = 0; iteration < iterations; iteration += 1) {
            output = instance.format(text, locale);
            consumedLength += output.length;
          }

          samples.push((performance.now() - start) / iterations);
          assert.equal(output, expected);
        }

        return {
          name: workload.name,
          locale,
          inputUtf16: text.length,
          inputSha256: createHash('sha256').update(text).digest('hex'),
          outputUtf16: expected.length,
          firstCallMs,
          heapUsedBeforeBytes: heapBefore,
          heapUsedAfterBytes: process.memoryUsage().heapUsed,
          iterations,
          ...summarize(samples),
        };
      });

      results.push({
        profile: profile.name,
        categories: profile.categories,
        algorithm: useFast ? 'khristov' : 'knuth-liang',
        useFast,
        cacheSizeMiB: cacheSize,
        preparation: summarize(preparation),
        processing,
      });
    }
  }
}

const report = {
  createdAt: new Date().toISOString(),
  implementationCommit: values['source-commit'] ?? null,
  workingTree: values['working-tree'] ?? null,
  node: process.version,
  icu: process.versions.icu ?? null,
  os: `${platform()} ${release()}`,
  cpu: cpus()[0]?.model ?? null,
  sampleCount,
  warmupIterations,
  procedure:
    'Imports and filesystem reads are excluded. Construction prepares both bundled locales in fresh instances; this is cold service setup, not cold process startup. Three preliminary construction samples are discarded. Formatting shares one instance across all six workloads and both locales. First-call timing may reuse words from earlier workloads. Three warm-up calls precede seven samples of five repeated calls on the original input. Timings are per call. Validation is outside timed sections and checks letters, marks, digits, deterministic output, and equality with the same uncached profile and algorithm. Profiles run in fixed order; JIT, GC and system noise affect results. Category selections are identical across algorithm/cache pairs. Heap snapshots include the whole process and temporary allocations, with no forced GC; they do not measure retained cache size, peak allocation or the approximate cache budget.',
  workloads,
  consumedLength,
  results,
};
const output = resolve(values.output);
await mkdir(dirname(output), { recursive: true });
await writeFile(output, JSON.stringify(report, null, 2) + '\n');
console.log(output);
