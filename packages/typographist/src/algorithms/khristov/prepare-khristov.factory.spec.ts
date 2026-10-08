import type { KhristovRules } from '@/algorithms/khristov/khristov-rules.types.js';
import { prepareKhristov } from '@/algorithms/khristov/prepare-khristov.factory.js';
import { prepareExclusions } from '@/text/exclusions/prepare-exclusions.util.js';
import { formatWord } from '@/text/word-breaks/format-word.util.js';

const rules: KhristovRules = {
  locale: 'custom',
  alphabet: 'abcё',
  vowels: 'aё',
  consonants: 'bc',
  specialLetters: '',
  leftMin: 1,
  rightMin: 1,
};

const breaks = (engine: ReturnType<typeof prepareKhristov>, word: string) => {
  const normalized = engine.normalize(word);

  if (normalized === null) {
    throw new Error('Fixture word must be supported');
  }

  return engine.wordBreaks(normalized.analysis);
};

describe('prepareKhristov', () => {
  it('prepares arbitrary alphabets and preserves original uppercase and decomposed offsets', () => {
    const engine = prepareKhristov(rules);

    expect(breaks(engine, 'baba')).toEqual([2]);
    expect(breaks(engine, 'BABA')).toEqual([2]);
    expect(breaks(engine, 'bе\u0308ba')).toEqual([3]);
    expect(engine.normalize('ba\u0301ba')).toBeNull();
    expect(engine.normalize('badaba')).toBeNull();
  });

  it('filters unmappable marks after they have acted as barriers', () => {
    const engine = prepareKhristov(rules);

    expect(engine.wordBreaks({ symbols: Array.from('bacccaba'), boundaries: [0, 1, 2, 3, null, 5, 6, 7, 8] })).toEqual([
      6,
    ]);
  });

  it('applies exception precedence and original grapheme minima through the existing formatter', () => {
    const algorithm = prepareKhristov({
      ...rules,
      leftMin: 2,
      rightMin: 2,
      exceptions: [
        { word: 'baba', positions: [] },
        { word: 'bacaba', positions: [1, 3] },
        { word: 'bёba', positions: [2] },
      ],
    });
    const context = { algorithm, exclusions: prepareExclusions({}) };

    expect(formatWord('baba', context)).toBe('baba');
    expect(formatWord('BACABA', context)).toBe('BAC\u00adABA');
    expect(formatWord('bе\u0308ba', context)).toBe('bе\u0308\u00adba');
  });

  it('snapshots classifications, alphabet, minima, and exceptions independently', () => {
    const positions = [3];
    const exceptions = [{ word: 'bacaba', positions }];
    const mutable = { ...rules, exceptions };
    const first = prepareKhristov(mutable);
    mutable.vowels = 'b';
    mutable.consonants = 'acё';
    mutable.leftMin = 9;
    const second = prepareKhristov(mutable);
    positions[0] = 2;
    exceptions.length = 0;
    mutable.alphabet = 'xyz';

    expect(breaks(first, 'baba')).toEqual([2]);
    expect(breaks(second, 'baba')).toEqual([]);
    expect(first.leftMin).toBe(1);
    expect(first.normalize('baba')).not.toBeNull();
    expect(first.exceptionBreaks({ symbols: Array.from('bacaba'), boundaries: [0, 1, 2, 3, 4, 5, 6] })).toEqual([3]);
  });

  it.each([
    { vowels: 'a' },
    { consonants: 'abc' },
    { specialLetters: 'z' },
    { vowels: 'aaё' },
    { alphabet: 'abcЁ', vowels: 'aЁ' },
    { alphabet: '' },
    { alphabet: 'abc\ud800' },
  ])('rejects incomplete, contradictory, or non-normalized classifications %j', (changes) => {
    expect(() => prepareKhristov({ ...rules, ...changes })).toThrow(TypeError);
  });

  it.each([0, -1, NaN, Infinity, 1.5])('rejects invalid minima %j', (minimum) => {
    expect(() => prepareKhristov({ ...rules, leftMin: minimum })).toThrow(RangeError);
    expect(() => prepareKhristov({ ...rules, rightMin: minimum })).toThrow(RangeError);
  });

  it('rejects invalid exception offsets', () => {
    expect(() => prepareKhristov({ ...rules, exceptions: [{ word: 'baba', positions: [2, 2] }] })).toThrow(RangeError);
  });
});
