import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { performance } from 'node:perf_hooks';

import type {
  ExternalImplementation,
  ImplementationResult,
  ProcessingResult,
  TextFormatter,
  Workload,
} from './benchmark.types.ts';
import { sampleCount, summarize, warmupIterations } from './measurement.util.ts';

export const validateExternalOutput = (format: TextFormatter, expected: string, { text, locale }: Workload) => {
  const sourcePreserved = expected.replaceAll('\u00ad', '') === text.replaceAll('\u00ad', '');
  const idempotent = format(expected, locale) === expected;
  let graphemeSafe: boolean | null = null;

  if (sourcePreserved) {
    const boundaries = new Set(
      Array.from(new Intl.Segmenter('und', { granularity: 'grapheme' }).segment(text), ({ index }) => index),
    );
    let offset = 0;
    graphemeSafe = true;

    for (const character of expected) {
      if (character === '\u00ad' && text[offset] !== '\u00ad') {
        graphemeSafe &&= boundaries.has(offset);
      } else {
        offset += character.length;
      }
    }

    graphemeSafe &&= offset === text.length;
  }

  return { sourcePreserved, idempotent, graphemeSafe };
};

export const measureExternal = async (implementation: ExternalImplementation, workloads: readonly Workload[]) => {
  const preparation: number[] = [];
  let consumedLength = 0;

  for (let index = 0; index < warmupIterations + sampleCount; index += 1) {
    const create = await implementation.prepare();
    const start = performance.now();
    const format = create();
    const elapsed = performance.now() - start;
    consumedLength += format('table', 'en').length;

    if (index >= warmupIterations) preparation.push(elapsed);
  }

  const create = await implementation.prepare();
  const format = create();
  const processing: ProcessingResult[] = [];
  const skippedWorkloads: { name: string; locale: 'en' | 'ru'; reason: string }[] = [];

  for (const workload of workloads) {
    const { text, locale, name } = workload;
    let expected: string;
    let checked: ReturnType<typeof validateExternalOutput>;

    try {
      expected = format(text, locale);
      checked = validateExternalOutput(format, expected, workload);
    } catch (error) {
      skippedWorkloads.push({ name, locale, reason: error instanceof Error ? error.message : String(error) });
      continue;
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
    processing.push({
      name,
      locale,
      inputUtf16: text.length,
      outputUtf16: expected.length,
      inputSha256: createHash('sha256').update(text).digest('hex'),
      iterations,
      ...timing,
      millionUtf16PerSecond: text.length / timing.medianMs / 1000,
      validation: checked,
    });
  }

  const result: ImplementationResult = {
    id: implementation.id,
    algorithm: implementation.algorithm,
    version: implementation.version,
    notes: implementation.notes,
    useFast: null,
    preparation: summarize(preparation),
    processing,
    skippedWorkloads,
    consumedLength,
  };

  return result;
};
