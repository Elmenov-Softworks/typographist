import assert from 'node:assert/strict';
import { performance } from 'node:perf_hooks';

import { Typographist } from '@elmenov-softworks/typographist';

const setupStart = performance.now();
const instance = new Typographist({ locale: 'ru', categories: ['quotes'] });
const setupMs = performance.now() - setupStart;
const repetitions = 7;
const results = [];

for (const count of [5_000, 10_000, 20_000, 50_000]) {
  const input = '"'.repeat(count) + 'cat';
  const expected = '«\u202f' + '„\u202f'.repeat(count - 1) + 'cat';

  for (let warmup = 0; warmup < 3; warmup++) {
    assert.equal(instance.format(input), expected);
  }

  const samplesMs = [];

  for (let sample = 0; sample < repetitions; sample++) {
    const start = performance.now();
    const output = instance.format(input);
    samplesMs.push(performance.now() - start);
    assert.equal(output, expected);
  }

  const sorted = [...samplesMs].sort((first, second) => first - second);
  results.push({ count, inputUtf16: input.length, outputUtf16: expected.length, samplesMs, medianMs: sorted[3] });
}

console.log(
  JSON.stringify(
    {
      runtime: process.version,
      locale: 'ru',
      categories: ['quotes'],
      setupMs,
      warmups: 3,
      repetitions,
      input: 'A run of ASCII double quotes followed by cat',
      memory: 'Not measured; temporary allocations and GC affect timings.',
      results,
    },
    null,
    2,
  ),
);
