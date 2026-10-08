import { prepareKnuthLiang } from '@/algorithms/knuth-liang/prepare-knuth-liang.factory.js';
import { createHyphenator } from '@/text/create-hyphenator.factory.js';

const prepare = () =>
  prepareKnuthLiang({
    locale: 'en',
    alphabet: 'abcdefghijklmnopqrstuvwxyz',
    leftMin: 1,
    rightMin: 1,
    patterns: ['b1c'],
  });
const create = (algorithm = prepare(), excludedWords: ReadonlySet<string> = new Set()) =>
  createHyphenator({ algorithm, excludedWords });

it('binds each service to its own prepared strategy', () => {
  const first = create();
  const second = create({ ...prepare(), wordBreaks: () => [3] });

  expect(first.hyphenate('abcd')).toBe('ab\u00adcd');
  expect(second.hyphenate('abcd')).toBe('abc\u00add');
  expect(first.hyphenate('abcd')).toBe('ab\u00adcd');
});

it('preserves protected and excluded words before normalization', () => {
  const algorithm = prepare();
  const normalize = vi.fn(algorithm.normalize);
  const service = create({ ...algorithm, normalize }, new Set(['abcd']));
  const text =
    'abcd ab\u00adcd abcd123 user_name userName abcd\u2011abcd first.last+tag@example-domain.com https://abcd.com';

  expect(service.hyphenate(text)).toBe(text);
  expect(normalize).not.toHaveBeenCalled();
});

it('preserves unsupported complete tokens and remains idempotent', () => {
  const service = create();
  const unsupported = 'abcdж ab\u0301cd ab\u200dcd ab\ud800cd';

  expect(service.hyphenate(unsupported)).toBe(unsupported);
  const once = service.hyphenate('abcd-abcd\u00ad efgh 😀');

  expect(once).toBe('ab\u00adcd-abcd\u00ad efgh 😀');
  expect(service.hyphenate(once)).toBe(once);
  expect(service.hyphenate('')).toBe('');
});

it('honors break and no-break exceptions before the strategy and filters minima', () => {
  const prepared = prepareKnuthLiang({
    locale: 'en',
    alphabet: 'abcdefghijklmnopqrstuvwxyz',
    leftMin: 2,
    rightMin: 2,
    patterns: ['a1b', 'b1c', 'c1d'],
    exceptions: [
      { word: 'abcd', positions: [1, 2, 3] },
      { word: 'efgh', positions: [] },
    ],
  });
  const wordBreaks = vi.fn(prepared.wordBreaks);
  const service = create({ ...prepared, wordBreaks });

  expect(service.hyphenate('ABCD efgh')).toBe('AB\u00adCD efgh');
  expect(wordBreaks).not.toHaveBeenCalled();
});

it('preserves words too short for minima while retaining exactly long enough words', () => {
  const algorithm = prepareKnuthLiang({
    locale: 'en',
    alphabet: 'abcde',
    leftMin: 2,
    rightMin: 3,
    patterns: ['b1c'],
  });
  const service = create(algorithm);

  expect(service.hyphenate('a ab abc abcd abcde')).toBe('a ab abc abcd ab\u00adcde');
});

it('rejects non-string text at the formatting boundary', () => {
  const service = create();

  expect(() => {
    Reflect.apply(service.hyphenate, service, [null]);
  }).toThrow(TypeError);
});
