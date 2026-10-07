import { prepareKnuthLiang } from '@/algorithms/knuth-liang/prepare-knuth-liang.factory.js';
import type { PreparedAlgorithm } from '@/algorithms/prepared-algorithm.types.js';
import { createAlphabetNormalizer } from '@/languages/analysis/alphabet-normalizer.factory.js';
import { createHyphenator } from '@/text/create-hyphenator.factory.js';

const prepare = () =>
  prepareKnuthLiang([
    {
      id: 'test',
      normalize: createAlphabetNormalizer('abcdefghijklmnopqrstuvwxyz'),
      leftMin: 1,
      rightMin: 1,
      patterns: ['b1c'],
    },
    {
      id: 'other',
      normalize: createAlphabetNormalizer('abcdefghijklmnopqrstuvwxyz'),
      leftMin: 1,
      rightMin: 1,
      patterns: ['a1b'],
    },
  ]);

it('routes default, call, and selector languages in precedence order', () => {
  const algorithm = prepare();
  const service = createHyphenator({ algorithm, defaultLanguage: 'TEST' });

  expect(service.hyphenate('abcd')).toBe('ab\u00adcd');
  expect(service.hyphenate('abcd', { language: 'OTHER' })).toBe('a\u00adbcd');

  const selector = vi.fn(() => 'test');
  const selected = createHyphenator({ algorithm, defaultLanguage: 'other', wordSelector: selector });

  expect(selected.hyphenate('abcd', { language: 'other' })).toBe('ab\u00adcd');
  expect(selector).toHaveBeenCalledWith('abcd', 'other');
});

it('substitutes algorithms without changing common processing', () => {
  const algorithm: PreparedAlgorithm = { languages: prepare().languages, wordBreaks: () => [3] };

  expect(createHyphenator({ algorithm, defaultLanguage: 'test' }).hyphenate('abcd')).toBe('abc\u00add');
});

it('preserves protected words before callbacks and remains idempotent', () => {
  const selector = vi.fn(() => 'test');
  const service = createHyphenator({ algorithm: prepare(), defaultLanguage: 'test', wordSelector: selector });
  const text =
    'ab\u00adcd abcd123 user_name userName abcd\u2011abcd first.last+tag@example-domain.com https://abcd.com';

  expect(service.hyphenate(text)).toBe(text);
  expect(selector).not.toHaveBeenCalled();

  const once = service.hyphenate('abcd-abcd\u00ad efgh 😀');

  expect(once).toBe('ab\u00adcd-abcd\u00ad efgh 😀');
  expect(service.hyphenate(once)).toBe(once);
});

it('preserves unsupported complete tokens and selector null', () => {
  const service = createHyphenator({ algorithm: prepare(), defaultLanguage: 'test' });

  expect(service.hyphenate('abcdж ab\u0301cd ab\u200dcd ab\ud800cd')).toBe('abcdж ab\u0301cd ab\u200dcd ab\ud800cd');
  expect(
    createHyphenator({ algorithm: prepare(), defaultLanguage: 'test', wordSelector: () => null }).hyphenate('abcd'),
  ).toBe('abcd');
});

it('applies user exceptions before algorithms and applies all limits', () => {
  const wordBreaks = vi.fn(() => [2]);
  const algorithm: PreparedAlgorithm = { languages: prepare().languages, wordBreaks };
  const service = createHyphenator({
    algorithm,
    defaultLanguage: 'test',
    languages: { TEST: { exceptions: [{ word: 'abcd', positions: [1] }] } },
  });

  expect(service.hyphenate('ABCD')).toBe('A\u00adBCD');
  expect(wordBreaks).not.toHaveBeenCalled();

  const limited = createHyphenator({
    algorithm,
    defaultLanguage: 'test',
    languages: { test: { leftMin: 3, minWordLength: 4 } },
  });

  expect(limited.hyphenate('abcd abc')).toBe('abcd abc');
  expect(wordBreaks).toHaveBeenCalledTimes(1);
});

it('validates selections even for empty text', () => {
  const service = createHyphenator({ algorithm: prepare(), defaultLanguage: 'test' });

  expect(service.hyphenate('')).toBe('');
  expect(() => service.hyphenate('', { language: 'en-GB' })).toThrow(RangeError);
  expect(() => createHyphenator({ algorithm: prepare(), defaultLanguage: 'en' })).toThrow(RangeError);
  expect(() =>
    createHyphenator({ algorithm: prepare(), defaultLanguage: 'test', wordSelector: () => 'missing' }).hyphenate(
      'abcd',
    ),
  ).toThrow(RangeError);
});

it('supports reentrant callbacks without corrupting output', () => {
  const service = createHyphenator({
    algorithm: prepare(),
    defaultLanguage: 'test',
    wordSelector: (word) => {
      if (word === 'abcd') {
        expect(service.hyphenate('efgh')).toBe('efgh');
      }

      return 'test';
    },
  });

  expect(service.hyphenate('abcd abcd')).toBe('ab\u00adcd ab\u00adcd');
});

it('validates third-party results and propagates callback errors', () => {
  const invalid: PreparedAlgorithm = { languages: prepare().languages, wordBreaks: () => [2, 2] };

  expect(() => createHyphenator({ algorithm: invalid, defaultLanguage: 'test' }).hyphenate('abcd')).toThrow(RangeError);

  const failure = new Error('callback failed');
  const service = createHyphenator({
    algorithm: prepare(),
    defaultLanguage: 'test',
    wordSelector: () => {
      throw failure;
    },
  });

  expect(() => service.hyphenate('abcd')).toThrow(failure);
});

it.each([vi.fn(), () => false, () => ({}), () => Promise.resolve([])])(
  'rejects malformed plugin exception results without invoking the algorithm',
  (exceptionBreaks) => {
    const prepared = prepare().languages[0];

    if (prepared === undefined) {
      throw new Error('Missing test profile');
    }

    const profile = { ...prepared };
    Reflect.set(profile, 'exceptionBreaks', exceptionBreaks);
    const wordBreaks = vi.fn(() => [2]);
    const service = createHyphenator({
      algorithm: { languages: [profile], wordBreaks },
      defaultLanguage: 'test',
    });

    expect(() => service.hyphenate('abcd')).toThrow(TypeError);
    expect(wordBreaks).not.toHaveBeenCalled();
  },
);

it('snapshots caller configuration and isolates service instances', () => {
  const algorithm = { languages: [...prepare().languages], wordBreaks: () => [2] };
  const policy = { leftMin: 1, exceptions: [{ word: 'abcd', positions: [1] }] };
  const options = { algorithm, defaultLanguage: 'test', languages: { test: policy } };
  const first = createHyphenator(options);
  policy.leftMin = 4;
  policy.exceptions[0]?.positions.push(3);
  algorithm.wordBreaks = () => [3];
  algorithm.languages.length = 0;
  options.defaultLanguage = 'missing';

  expect(first.hyphenate('abcd efgh')).toBe('a\u00adbcd ef\u00adgh');
  expect(createHyphenator({ algorithm: prepare(), defaultLanguage: 'other' }).hyphenate('abcd')).toBe('a\u00adbcd');
});

it('uses plugin exceptions and permits explicit exclusion disabling for supported tokens', () => {
  const algorithm = prepareKnuthLiang([
    {
      id: 'custom',
      normalize: createAlphabetNormalizer('abc123_'),
      leftMin: 1,
      rightMin: 1,
      patterns: ['a1b'],
      exceptions: [{ word: 'abc', positions: [] }],
    },
  ]);
  const service = createHyphenator({
    algorithm,
    defaultLanguage: 'custom',
    exclusions: { numbers: false, underscores: false },
  });

  expect(service.hyphenate('abc ab1 ab_c')).toBe('abc a\u00adb1 a\u00adb_c');
});

it('rejects duplicate registrations and malformed numeric policies', () => {
  const languages = prepare().languages;
  const profile = languages[0];

  if (profile === undefined) {
    throw new Error('Missing test profile');
  }

  expect(() =>
    createHyphenator({
      algorithm: { languages: [profile, { ...profile, id: 'TEST' }], wordBreaks: () => [] },
      defaultLanguage: 'test',
    }),
  ).toThrow(RangeError);
  expect(() =>
    createHyphenator({ algorithm: prepare(), defaultLanguage: 'test', languages: { test: { leftMin: NaN } } }),
  ).toThrow(RangeError);
});
