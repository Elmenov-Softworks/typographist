import { prepareExceptionTable } from '@/languages/exceptions/exception-table.util.js';
import { createAlphabetNormalizer } from '@/languages/analysis/alphabet-normalizer.factory.js';

const normalize = createAlphabetNormalizer('abcdefghijklmnopqrstuvwxyzёлка');

const analyze = (word: string) => {
  const analysis = normalize(word);

  if (analysis === null) {
    throw new Error('Unsupported test word');
  }

  return analysis.analysis;
};

describe('prepared language exceptions', () => {
  it('maps canonical equivalents and uppercase to their original offsets', () => {
    const table = prepareExceptionTable([{ word: 'ёлка', positions: [2] }], normalize);

    expect(table.lookup(analyze('е\u0308лка'))).toEqual([3]);
    expect(table.lookup(analyze('ЁЛКА'))).toEqual([2]);
  });

  it('distinguishes no-break exceptions from absent entries', () => {
    const table = prepareExceptionTable([{ word: 'present', positions: [] }], normalize);

    expect(table.lookup(analyze('PRESENT'))).toEqual([]);
    expect(table.lookup(analyze('table'))).toBeNull();
  });

  it('snapshots entries and returns independent results', () => {
    const positions = [2];
    const entries = [{ word: 'table', positions }];
    const table = prepareExceptionTable(entries, normalize);
    positions[0] = 3;
    entries[0] = { word: 'other', positions: [] };
    table.lookup(analyze('table'))?.push(4);

    expect(table.lookup(analyze('table'))).toEqual([2]);
  });

  it('accepts equivalent duplicates but rejects conflicting normalized keys', () => {
    expect(() =>
      prepareExceptionTable(
        [
          { word: 'table', positions: [2] },
          { word: 'TABLE', positions: [2] },
        ],
        normalize,
      ),
    ).not.toThrow();
    expect(() =>
      prepareExceptionTable(
        [
          { word: 'table', positions: [2] },
          { word: 'TABLE', positions: [] },
        ],
        normalize,
      ),
    ).toThrow(RangeError);
  });

  it.each([[0], [5], [2, 2], [3, 2], [1.5], [NaN], [Infinity]].map((positions) => ({ positions })))(
    'rejects invalid offsets %j',
    ({ positions }) => {
      expect(() => prepareExceptionTable([{ word: 'table', positions }], normalize)).toThrow(RangeError);
    },
  );

  it('rejects offsets inside an original grapheme', () => {
    expect(() => prepareExceptionTable([{ word: 'е\u0308лка', positions: [1] }], normalize)).toThrow(RangeError);
  });

  it('rejects unsupported examples', () => {
    expect(() => prepareExceptionTable([{ word: 'café', positions: [] }], normalize)).toThrow(TypeError);
  });

  it('discards a suggestion inside a case expansion in another spelling', () => {
    const expanded = createAlphabetNormalizer('asiß');
    const table = prepareExceptionTable([{ word: 'assi', positions: [2] }], expanded);
    const analysis = { symbols: ['a', 's', 's', 'i'], boundaries: [0, 1, null, 2, 3] };

    expect(table.lookup(analysis)).toEqual([]);
  });
});
