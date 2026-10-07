import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { cpus, platform, release } from 'node:os';
import { performance } from 'node:perf_hooks';

import { createHyphenator, enUS, prepareKnuthLiang, ru } from '../../packages/typographist/dist/index.js';

const implementationCommit = process.argv[2];
if (implementationCommit === undefined || !/^[a-f0-9]{40}$/u.test(implementationCommit)) {
  throw new TypeError('Pass the measured implementation commit as the first argument');
}

const sampleCount = 7;
const warmupIterations = 3;
let consumedLength = 0;
const summarize = (samples: number[]) => {
  const sorted = [...samples].sort((left, right) => left - right);
  return {
    minMs: sorted[0],
    medianMs: sorted[Math.floor(sorted.length / 2)],
    maxMs: sorted.at(-1),
    samplesMs: samples,
  };
};

const preparationSamples: number[] = [];
for (let index = 0; index < warmupIterations + sampleCount; index += 1) {
  const start = performance.now();
  const prepared = prepareKnuthLiang([ru, enUS]);
  const elapsed = performance.now() - start;
  consumedLength += prepared.languages.length;
  if (index >= warmupIterations) preparationSamples.push(elapsed);
}

const algorithm = prepareKnuthLiang([ru, enUS]);
const russian = createHyphenator({ algorithm, defaultLanguage: 'ru' });
const english = createHyphenator({ algorithm, defaultLanguage: 'en-US' });
const mixed = createHyphenator({
  algorithm,
  defaultLanguage: 'en-US',
  wordSelector: (word) => (/[а-яё]/iu.test(word) ? 'ru' : 'en-US'),
});
assert.equal(english.hyphenate('table TABLE present'), 'ta\u00adble TA\u00adBLE present');
assert.equal(russian.hyphenate('асбест'), 'ас\u00adбест');

const ruParagraph =
  'Перенос слов помогает читать длинные предложения. АСБЕСТ ёлка е\u0308лка машина ма\u0301шина 😀 пе\u00adренос. ';
const enParagraph =
  'Hyphenation improves typography with representative vocabulary. TABLE present computer extraordinary userName ISO9001 first.last+tag@example-domain.com https://example.com/typography 😀. ';
let seed = 42;
const variedWords = Array.from({ length: 2000 }, () => {
  let word = '';
  for (let index = 0; index < 12; index += 1) {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    word += String.fromCharCode(97 + (seed % 26));
  }
  return word;
}).join(' ');
const workloads = [
  { name: 'short-en', text: 'table extraordinary', service: english },
  { name: 'paragraph-ru', text: ruParagraph, service: russian },
  { name: 'paragraph-en', text: enParagraph, service: english },
  { name: 'repeated-words', text: 'extraordinary '.repeat(2000), service: english },
  { name: 'varied-vocabulary', text: variedWords, service: english },
];
for (const size of [1000, 4000, 16000]) {
  workloads.push(
    { name: `ru-${String(size)}`, text: ruParagraph.repeat(Math.ceil(size / ruParagraph.length)), service: russian },
    { name: `en-${String(size)}`, text: enParagraph.repeat(Math.ceil(size / enParagraph.length)), service: english },
    {
      name: `mixed-${String(size)}`,
      text: (ruParagraph + enParagraph).repeat(Math.ceil(size / (ruParagraph.length + enParagraph.length))),
      service: mixed,
    },
    { name: `long-word-${String(size)}`, text: 'ab'.repeat(size / 2), service: english },
    { name: `combining-run-${String(size)}`, text: 'a' + '\u0301'.repeat(size) + 'b', service: english },
    { name: `email-near-match-${String(size)}`, text: 'a.'.repeat(size / 2) + '@invalid', service: english },
    { name: `scheme-near-match-${String(size)}`, text: 'a'.repeat(size) + ':/word', service: english },
  );
}

const processing = workloads.map(({ name, text, service }) => {
  const expected = service.hyphenate(text);
  assert.equal(expected.replaceAll('\u00ad', ''), text.replaceAll('\u00ad', ''));
  assert.equal(service.hyphenate(expected), expected);
  const graphemeBoundaries = new Set(
    Array.from(new Intl.Segmenter('und', { granularity: 'grapheme' }).segment(text), ({ index }) => index),
  );
  let originalOffset = 0;
  for (const character of expected) {
    if (character === '\u00ad' && text[originalOffset] !== '\u00ad') {
      assert.ok(graphemeBoundaries.has(originalOffset));
    } else {
      originalOffset += character.length;
    }
  }
  const iterations = Math.max(1, Math.min(200, Math.floor(20000 / text.length)));
  for (let index = 0; index < warmupIterations; index += 1) consumedLength += service.hyphenate(text).length;
  const samples: number[] = [];
  for (let sample = 0; sample < sampleCount; sample += 1) {
    const start = performance.now();
    let output = '';
    for (let index = 0; index < iterations; index += 1) {
      output = service.hyphenate(text);
      consumedLength += output.length;
    }
    samples.push((performance.now() - start) / iterations);
    assert.equal(output, expected);
  }
  const timing = summarize(samples);
  assert.ok(timing.medianMs !== undefined);
  return {
    name,
    inputUtf16: text.length,
    outputUtf16: expected.length,
    inputSha256: createHash('sha256').update(text).digest('hex'),
    iterations,
    ...timing,
    millionUtf16PerSecond: text.length / timing.medianMs / 1000,
  };
});

console.log(
  JSON.stringify(
    {
      implementationCommit: implementationCommit,
      node: process.version,
      icu: process.versions.icu,
      os: `${platform()} ${release()}`,
      cpu: cpus()[0]?.model,
      sampleCount,
      warmupIterations,
      preparation: summarize(preparationSamples),
      processing,
      consumedLength,
    },
    null,
    2,
  ),
);
