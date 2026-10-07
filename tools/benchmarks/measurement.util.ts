import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { performance } from 'node:perf_hooks';
import { verifyFastFixtures } from './verify-fast-fixtures.util.ts';

import type {
  BenchmarkImplementation,
  ImplementationResult,
  TextFormatter,
  Timing,
  Workload,
} from './benchmark.types.ts';

export const sampleCount = 7;
export const warmupIterations = 3;

const summarize = (samples: readonly number[]) => {
  const sorted = [...samples].sort((left, right) => left - right);
  const minMs = sorted[0];
  const medianMs = sorted[Math.floor(sorted.length / 2)];
  const maxMs = sorted.at(-1);

  if (minMs === undefined || medianMs === undefined || maxMs === undefined) {
    throw new RangeError('At least one timing sample is required');
  }

  const timing: Timing = { minMs, medianMs, maxMs, samplesMs: samples };

  return timing;
};

const verifyOutput = (format: TextFormatter, { text, locale }: Workload) => {
  const expected = format(text, locale);
  assert.equal(expected.replaceAll('\u00ad', ''), text.replaceAll('\u00ad', ''));
  assert.equal(format(expected, locale), expected);
  const boundaries = new Set(
    Array.from(new Intl.Segmenter('und', { granularity: 'grapheme' }).segment(text), ({ index }) => index),
  );
  let originalOffset = 0;

  for (const character of expected) {
    if (character === '\u00ad' && text[originalOffset] !== '\u00ad') {
      assert.ok(boundaries.has(originalOffset));
    } else {
      originalOffset += character.length;
    }
  }

  assert.equal(originalOffset, text.length);

  return expected;
};

export const measureImplementation = (
  implementation: BenchmarkImplementation,
  workloads: readonly Workload[],
  reference: TextFormatter | null,
) => {
  let consumedLength = 0;
  const preparationSamples: number[] = [];

  for (let index = 0; index < warmupIterations + sampleCount; index += 1) {
    const start = performance.now();
    const format = implementation.create();
    const elapsed = performance.now() - start;
    consumedLength += format('table', 'en').length;

    if (index >= warmupIterations) {
      preparationSamples.push(elapsed);
    }
  }

  const format = implementation.create();
  assert.equal(format('table TABLE present', 'en'), 'ta\u00adble TA\u00adBLE present');
  assert.equal(format('асбест', 'ru'), 'ас\u00adбест');
  if (implementation.algorithm === 'khristov') {
    verifyFastFixtures(format);
  }

  const processing = workloads.map((workload) => {
    const { text, locale, name } = workload;
    const expected = verifyOutput(format, workload);

    if (reference !== null && implementation.algorithm === 'knuth-liang') {
      assert.equal(expected, reference(text, locale), `Output mismatch: ${implementation.id}, ${name}`);
    }

    const iterations = Math.max(1, Math.min(200, Math.floor(20000 / text.length)));

    for (let index = 0; index < warmupIterations; index += 1) {
      consumedLength += format(text, locale).length;
    }

    const samples: number[] = [];

    for (let sample = 0; sample < sampleCount; sample += 1) {
      const start = performance.now();
      let output = '';

      for (let index = 0; index < iterations; index += 1) {
        output = format(text, locale);
        consumedLength += output.length;
      }

      samples.push((performance.now() - start) / iterations);
      assert.equal(output, expected);
    }

    const timing = summarize(samples);

    return {
      name,
      locale,
      inputUtf16: text.length,
      outputUtf16: expected.length,
      inputSha256: createHash('sha256').update(text).digest('hex'),
      iterations,
      ...timing,
      millionUtf16PerSecond: text.length / timing.medianMs / 1000,
    };
  });
  const result: ImplementationResult = {
    id: implementation.id,
    algorithm: implementation.algorithm,
    useFast: implementation.useFast,
    preparation: summarize(preparationSamples),
    processing,
    consumedLength,
  };

  return result;
};
