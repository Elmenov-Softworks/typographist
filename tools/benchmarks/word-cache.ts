import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import { cpus } from 'node:os';
import { dirname, resolve } from 'node:path';
import { performance } from 'node:perf_hooks';
import { parseArgs } from 'node:util';

import { Typographist } from '../../packages/typographist/dist/index.js';
import { sampleCount, summarize, warmupIterations } from './measurement.util.ts';
import { createWorkloads } from './workloads.constants.ts';

const { values } = parseArgs({
  options: {
    output: { type: 'string', default: '/tmp/typographist-benchmarks/word-cache.json' },
    commit: { type: 'string' },
  },
});
const workloads = createWorkloads().filter(({ name }) => ['repeated-words', 'varied-vocabulary'].includes(name));
const measurements = [];
let consumedLength = 0;

for (const useFast of [false, true]) {
  for (const { name, text, locale } of workloads) {
    const expected = new Typographist({ useFast, cacheSize: 0 }).format(text, locale);

    for (const state of ['disabled', 'empty', 'warmed'] as const) {
      const cacheSize = state === 'disabled' ? 0 : 64;
      const preparationSamples: number[] = [];
      const warmupSamples: number[] = [];
      const formattingSamples: number[] = [];

      for (let sample = 0; sample < warmupIterations + sampleCount; sample += 1) {
        const preparationStart = performance.now();
        const formatter = new Typographist({ useFast, cacheSize });
        const preparationMs = performance.now() - preparationStart;
        let warmupMs = 0;

        if (state === 'warmed') {
          const warmupStart = performance.now();
          const warmedOutput = formatter.format(text, locale);
          warmupMs = performance.now() - warmupStart;
          assert.equal(warmedOutput, expected);
          consumedLength += warmedOutput.length;
        }

        const formattingStart = performance.now();
        const output = formatter.format(text, locale);
        const formattingMs = performance.now() - formattingStart;
        assert.equal(output, expected);
        consumedLength += output.length;

        if (sample >= warmupIterations) {
          preparationSamples.push(preparationMs);
          warmupSamples.push(warmupMs);
          formattingSamples.push(formattingMs);
        }
      }

      measurements.push({
        algorithm: useFast ? 'khristov' : 'knuth-liang',
        workload: name,
        locale,
        state,
        cacheSizeMiB: cacheSize,
        inputUtf16: text.length,
        inputSha256: createHash('sha256').update(text).digest('hex'),
        outputUtf16: expected.length,
        outputEqual: true,
        preparation: summarize(preparationSamples),
        cacheWarmup: summarize(warmupSamples),
        formatting: summarize(formattingSamples),
      });
    }
  }
}

const report = {
  createdAt: new Date().toISOString(),
  node: process.version,
  icu: process.versions.icu,
  cpu: cpus()[0]?.model ?? null,
  suppliedCommit: values.commit ?? null,
  sampleCount,
  discardedSamples: warmupIterations,
  procedure:
    'Each sample prepares a fresh instance outside formatting timing. Warmed samples format the identical input once before timing one further call. Empty and disabled samples time the first call. The first three samples per case are discarded for runtime warm-up. Output equality is checked outside timers. Fixed case order and runtime noise affect timings; estimated cache storage is not measured heap usage.',
  consumedLength,
  measurements,
};
const outputPath = resolve(values.output);
await mkdir(dirname(outputPath), { recursive: true });
await writeFile(outputPath, JSON.stringify(report, null, 2) + '\n');
console.log(outputPath);
