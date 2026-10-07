import type { CompiledRules } from '@/rules/compiled-rules.types.js';
import { prepareKnuthLiang } from '@/algorithms/knuth-liang/prepare-knuth-liang.factory.js';

const rules: CompiledRules = {
  locale: 'en',
  alphabet: 'abcdefghijklmnopqrstuvwxyzё',
  leftMin: 1,
  rightMin: 1,
  patterns: ['a1b'],
};
const analysis = { symbols: ['a', 'b', 'c', 'd'], boundaries: [0, 1, 2, 3, 4] };

describe('prepareKnuthLiang', () => {
  it.each([0, -1, NaN, Infinity, 1.5])('rejects invalid minima %j', (minimum) => {
    expect(() => prepareKnuthLiang({ ...rules, leftMin: minimum })).toThrow(RangeError);
    expect(() => prepareKnuthLiang({ ...rules, rightMin: minimum })).toThrow(RangeError);
  });

  it('snapshots patterns, minima, and normalized exceptions', () => {
    const patterns = ['a1b'];
    const positions = [2];
    const exceptions = [{ word: 'abcd', positions }];
    const mutable = { ...rules, patterns, exceptions };
    const engine = prepareKnuthLiang(mutable);
    patterns[0] = 'a2b';
    positions[0] = 1;
    exceptions.length = 0;
    mutable.leftMin = 9;
    mutable.alphabet = 'xyz';

    expect(engine.wordBreaks(analysis)).toEqual([1]);
    expect(engine.leftMin).toBe(1);
    expect(engine.exceptionBreaks(analysis)).toEqual([2]);
    expect(engine.normalize('abcd')?.analysis).toEqual(analysis);
  });

  it('discards boundaries inside normalization expansions', () => {
    const engine = prepareKnuthLiang({ ...rules, patterns: ['a1b', 'b1c'] });

    expect(engine.wordBreaks({ symbols: ['a', 'b', 'c'], boundaries: [0, null, 4, 8] })).toEqual([4]);
  });

  it('keeps prepared matchers independent', () => {
    const first = prepareKnuthLiang(rules);
    const replacement = prepareKnuthLiang({ ...rules, patterns: ['b1c'] });

    expect(first.wordBreaks(analysis)).toEqual([1]);
    expect(replacement.wordBreaks(analysis)).toEqual([2]);
    expect(first.wordBreaks(analysis)).toEqual([1]);
  });

  it('validates exceptions and alphabet during preparation', () => {
    expect(() => prepareKnuthLiang({ ...rules, exceptions: [{ word: 'abcd', positions: [1, 1] }] })).toThrow(
      RangeError,
    );
    expect(() => prepareKnuthLiang({ ...rules, alphabet: '' })).toThrow(TypeError);
    expect(() => prepareKnuthLiang({ ...rules, alphabet: 'abc\ud800' })).toThrow(TypeError);
    expect(() => prepareKnuthLiang({ ...rules, patterns: ['1'] })).toThrow();
  });
});
