import { createHyphenator, prepareKnuthLiang } from './index.js';
import type { KnuthLiangPlugin, PreparedAlgorithm, WordNormalizer } from './index.js';

const normalize: WordNormalizer = (word) => {
  if (!/^[a-z]+$/i.test(word)) {
    return null;
  }
  return {
    symbols: Array.from(word.toLowerCase()),
    boundaries: Array.from({ length: word.length + 1 }, (_, index) => index),
  };
};

const plugin: KnuthLiangPlugin = {
  id: 'custom',
  normalize,
  leftMin: 1,
  rightMin: 1,
  patterns: ['a1b'],
};

describe('public package entry point', () => {
  it('rejects deleted graphemes before exception lookup or algorithm invocation', () => {
    const liang = prepareKnuthLiang([
      {
        ...plugin,
        patterns: ['a1c'],
        normalize: () => ({ symbols: ['a', 'c', 'd'], boundaries: [0, 1, 3, 4] }),
      },
    ]);
    const exceptionBreaks = vi.fn(() => null);
    const wordBreaks = vi.fn(liang.wordBreaks);
    const algorithm: PreparedAlgorithm = {
      languages: liang.languages.map((profile) => ({ ...profile, exceptionBreaks })),
      wordBreaks,
    };
    const service = createHyphenator({ algorithm, defaultLanguage: 'custom' });

    expect(() => service.hyphenate('abcd')).toThrow(RangeError);
    expect(exceptionBreaks).not.toHaveBeenCalled();
    expect(wordBreaks).not.toHaveBeenCalled();
  });

  it.each([
    {
      word: 'A\u030Abcd',
      symbols: ['å', 'b', 'c', 'd'],
      boundaries: [0, 2, 3, 4, 5],
      pattern: 'å1b',
      expected: 'A\u030A\u00ADbcd',
    },
    {
      word: 'İbcd',
      symbols: ['i', '\u0307', 'b', 'c', 'd'],
      boundaries: [0, null, 1, 2, 3, 4],
      pattern: 'i1\u03071b',
      expected: 'İ\u00ADbcd',
    },
    {
      word: 'a\u0301bcd',
      symbols: ['a', '\u0301', 'b', 'c', 'd'],
      boundaries: [0, null, 2, 3, 4, 5],
      pattern: 'a1\u03011b',
      expected: 'a\u0301\u00ADbcd',
    },
  ])(
    'retains complete graphemes and expansion mappings for $word',
    ({ word, symbols, boundaries, pattern, expected }) => {
      const algorithm = prepareKnuthLiang([
        { ...plugin, normalize: () => ({ symbols, boundaries }), patterns: [pattern] },
      ]);
      const service = createHyphenator({ algorithm, defaultLanguage: 'custom' });

      expect(service.hyphenate(word)).toBe(expected);
    },
  );

  it('prepares a caller-supplied plugin and synchronously processes text', () => {
    const algorithm = prepareKnuthLiang([plugin]);
    const service = createHyphenator({ algorithm, defaultLanguage: 'CUSTOM' });

    const result = service.hyphenate('Abcd!');

    expect(result).toBe('A\u00ADbcd!');
    expect(service.hyphenate(result)).toBe(result);
  });

  it('substitutes an external algorithm through root configuration', () => {
    const liang = prepareKnuthLiang([plugin]);
    const external: PreparedAlgorithm = {
      languages: liang.languages,
      wordBreaks: () => [2],
    };
    const first = createHyphenator({ algorithm: liang, defaultLanguage: 'custom' });
    const second = createHyphenator({ algorithm: external, defaultLanguage: 'custom' });

    expect(first.hyphenate('abcd')).toBe('a\u00ADbcd');
    expect(second.hyphenate('abcd')).toBe('ab\u00ADcd');
    expect(first.hyphenate('abcd')).toBe('a\u00ADbcd');
  });
});
