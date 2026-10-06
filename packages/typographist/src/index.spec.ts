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
