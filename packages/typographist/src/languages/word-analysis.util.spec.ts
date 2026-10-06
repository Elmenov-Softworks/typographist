import { createAlphabetNormalizer, getGraphemeBoundaries, validateWordAnalysis } from './word-analysis.util.js';

const russian = createAlphabetNormalizer('абвгдеёжзийклмнопрстуфхцчшщъыьэюя');

describe('word analysis', () => {
  it('normalizes decomposed ё without changing original insertion offsets', () => {
    expect(russian('Е\u0308ЛКА')).toEqual({ symbols: ['ё', 'л', 'к', 'а'], boundaries: [0, 2, 3, 4, 5] });
    expect(russian('елка')?.symbols).toEqual(['е', 'л', 'к', 'а']);
  });

  it.each(['ма\u0301шина', 'hello', 'ёлка\ud800', 'мир\u200dмир', 'ёлка😀'])(
    'preserves unsupported complete word %s',
    (word) => {
      expect(russian(word)).toBeNull();
    },
  );

  it('maps case expansion without inventing an original boundary', () => {
    const normalize = createAlphabetNormalizer('i\u0307');

    expect(normalize('İ')).toEqual({ symbols: ['i', '\u0307'], boundaries: [0, null, 1] });
    expect(validateWordAnalysis('İ', normalize('İ'))?.graphemes).toEqual([0, 1]);
  });

  it('segments emoji, combining marks, and lone surrogates using the same boundary policy', () => {
    expect(getGraphemeBoundaries('е\u0308👩‍💻\ud800')).toEqual([0, 2, 7, 8]);
  });

  it('snapshots and freezes caller data', () => {
    const input = { symbols: ['a', 'b'], boundaries: [0, 1, 2] };
    const validated = validateWordAnalysis('ab', input);
    input.symbols[0] = 'z';
    input.boundaries[1] = 2;

    expect(validated?.analysis).toEqual({ symbols: ['a', 'b'], boundaries: [0, 1, 2] });
    expect(Object.isFrozen(validated?.analysis.symbols)).toBe(true);
    expect(Object.isFrozen(validated?.analysis.boundaries)).toBe(true);
  });

  it('distinguishes unsupported words from malformed and asynchronous analysis', () => {
    expect(validateWordAnalysis('a', null)).toBeNull();
    expect(() => validateWordAnalysis('a', Promise.resolve(null))).toThrow(TypeError);
    expect(() => validateWordAnalysis('a', { symbols: ['ab'], boundaries: [0, 1] })).toThrow(TypeError);
    expect(() => validateWordAnalysis('a', { symbols: ['\ud800'], boundaries: [0, 1] })).toThrow(TypeError);
    expect(() => validateWordAnalysis('a', { symbols: ['a'], boundaries: [null, 1] })).toThrow(TypeError);
  });

  it.each(
    [
      [0, 1, 3],
      [0, 3, 3],
      [0, 2.5, 3],
      [0, NaN, 3],
      [0, 4, 3],
    ].map((boundaries) => ({ boundaries })),
  )('rejects invalid original offsets $boundaries', ({ boundaries }) => {
    expect(() => validateWordAnalysis('a\u0308b', { symbols: ['ä', 'b'], boundaries })).toThrow(RangeError);
  });
});
