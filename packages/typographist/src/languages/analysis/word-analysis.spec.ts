import { createAlphabetNormalizer } from '@/languages/analysis/alphabet-normalizer.factory.js';

const russian = createAlphabetNormalizer('абвгдеёжзийклмнопрстуфхцчшщъыьэюя');

describe('word analysis', () => {
  it('normalizes simple Latin and Cyrillic letters with exact original offsets', () => {
    const normalize = createAlphabetNormalizer('abcаё');

    expect(normalize('ABCАЁ')).toEqual({
      analysis: { symbols: ['a', 'b', 'c', 'а', 'ё'], boundaries: [0, 1, 2, 3, 4, 5] },
      graphemes: [0, 1, 2, 3, 4, 5],
    });
    expect(normalize('ABCD')).toBeNull();
  });

  it('segments Hangul jamo before normalization instead of treating each letter as a grapheme', () => {
    const normalize = createAlphabetNormalizer('각');

    expect(normalize('\u1100\u1161\u11a8')).toEqual({
      analysis: { symbols: ['각'], boundaries: [0, 3] },
      graphemes: [0, 3],
    });
  });

  it('normalizes decomposed ё and retains original grapheme boundaries', () => {
    expect(russian('Е\u0308ЛКА')).toEqual({
      analysis: { symbols: ['ё', 'л', 'к', 'а'], boundaries: [0, 2, 3, 4, 5] },
      graphemes: [0, 2, 3, 4, 5],
    });
    expect(russian('елка')?.analysis.symbols).toEqual(['е', 'л', 'к', 'а']);
  });

  it.each(['ма\u0301шина', 'hello', 'ёлка\ud800', 'мир\u200dмир', 'ёлка😀'])(
    'preserves unsupported complete word %s',
    (word) => {
      expect(russian(word)).toBeNull();
    },
  );

  it('maps case expansion without inventing an original boundary', () => {
    const normalize = createAlphabetNormalizer('i\u0307');

    expect(normalize('İ')).toEqual({
      analysis: { symbols: ['i', '\u0307'], boundaries: [0, null, 1] },
      graphemes: [0, 1],
    });
  });

  it('retains a combining grapheme when NFC cannot compose it', () => {
    const normalize = createAlphabetNormalizer('qb\u0301');

    expect(normalize('q\u0301b')).toEqual({
      analysis: { symbols: ['q', '\u0301', 'b'], boundaries: [0, null, 2, 3] },
      graphemes: [0, 2, 3],
    });
  });

  it('keeps separate analyses independent', () => {
    const first = russian('ёлка');
    russian('молоко');

    expect(first?.analysis.boundaries).toEqual([0, 1, 2, 3, 4]);
    expect(first?.graphemes).toEqual([0, 1, 2, 3, 4]);
  });
});
