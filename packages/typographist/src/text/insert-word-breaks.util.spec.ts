import { getGraphemeBoundaries } from '../languages/word-analysis.util.js';
import { insertWordBreaks } from './insert-word-breaks.util.js';

const insert = (word: string, positions: unknown, leftMin = 1, rightMin = 1) =>
  insertWordBreaks(word, positions, getGraphemeBoundaries(word), leftMin, rightMin);

describe('insertWordBreaks', () => {
  it('inserts multiple opportunities without changing original characters', () => {
    expect(insert('abcdef', [1, 3, 5])).toBe('a\u00adbc\u00adde\u00adf');
  });

  it('accepts no-break output and returns short words unchanged', () => {
    expect(insert('a', [])).toBe('a');
    expect(insert('', [])).toBe('');
  });

  it('permits exact minima and omits candidates outside either limit', () => {
    expect(insert('abcd', [1, 2, 3], 2, 2)).toBe('ab\u00adcd');
    expect(insert('abcd', [2], 3, 2)).toBe('abcd');
    expect(insert('abcd', [2], 2, 3)).toBe('abcd');
  });

  it('counts original graphemes rather than UTF-16 units or matching symbols', () => {
    expect(insert('е\u0308лка', [2, 3, 4], 2, 2)).toBe('е\u0308л\u00adка');
    expect(insert('a😀bc', [1, 3, 4], 2, 2)).toBe('a😀\u00adbc');
  });

  it('preserves ill-formed UTF-16 when valid original boundaries are returned', () => {
    expect(insert('a\ud800bc', [2], 2, 2)).toBe('a\ud800\u00adbc');
  });

  it.each([null, undefined, {}, '1', Promise.resolve([]), new Uint32Array([1])])(
    'rejects non-array algorithm output %s',
    (result) => {
      expect(() => insert('abcd', result)).toThrow(TypeError);
    },
  );

  it.each([['1'], [null], [undefined], [{}]].map((result) => ({ result })))(
    'rejects nonnumeric offsets $result',
    ({ result }) => {
      expect(() => insert('abcd', result)).toThrow(TypeError);
    },
  );

  it.each(
    [[0], [-1], [4], [5], [1.5], [NaN], [Infinity], [Number.MAX_SAFE_INTEGER + 1], [2, 1], [2, 2]].map((result) => ({
      result,
    })),
  )('rejects invalid numeric offsets $result', ({ result }) => {
    expect(() => insert('abcd', result)).toThrow(RangeError);
  });

  it('rejects offsets inside combining sequences and surrogate pairs', () => {
    expect(() => insert('е\u0308лка', [1])).toThrow(RangeError);
    expect(() => insert('a😀bc', [2])).toThrow(RangeError);
  });

  it('validates even candidates that would be excluded by minima', () => {
    expect(() => insert('abcd', [1, 1], 3, 3)).toThrow(RangeError);
    expect(() => insert('е\u0308лка', [1], 3, 3)).toThrow(RangeError);
  });

  it('does not mutate caller offsets or boundaries', () => {
    const positions = Object.freeze([2]);
    const boundaries = Object.freeze([0, 1, 2, 3, 4]);

    expect(insertWordBreaks('abcd', positions, boundaries, 2, 2)).toBe('ab\u00adcd');
    expect(positions).toEqual([2]);
    expect(boundaries).toEqual([0, 1, 2, 3, 4]);
  });
});
