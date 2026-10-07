import { preparePatternMatcher } from '@/algorithms/knuth-liang/pattern-matcher.util.js';

describe('Knuth–Liang pattern matching', () => {
  it('lets an even maximum suppress an odd suggestion for the same key', () => {
    const matcher = preparePatternMatcher(['a1b', 'a2b']);

    expect(matcher.match(Array.from('abcd'))).toEqual([]);
  });

  it.each([
    ['a1b', 'a2b', 'a3b'],
    ['a3b', 'a2b', 'a1b'],
    ['a2b', 'a1b', 'a3b'],
  ])('restores a stronger odd suggestion independently of pattern order: %j', (...patterns) => {
    const matcher = preparePatternMatcher(patterns);

    expect(matcher.match(Array.from('abcd'))).toEqual([1]);
  });

  it('aggregates overlapping matches by maximum at each boundary', () => {
    const matcher = preparePatternMatcher(['a1b1c', 'b2c', 'bc3d']);

    expect(matcher.match(Array.from('abcd'))).toEqual([1, 3]);
  });

  it('matches anchors only at the beginning or end of the complete word', () => {
    const matcher = preparePatternMatcher(['.a1b', 'c1d.']);

    expect(matcher.match(Array.from('abcd'))).toEqual([1, 3]);
    expect(matcher.match(Array.from('zabcdz'))).toEqual([]);
  });

  it('discards artificial and outer word boundaries', () => {
    const matcher = preparePatternMatcher(['1.a', '.1a', 'd1.', 'd.1']);

    expect(matcher.match(Array.from('abcd'))).toEqual([]);
    expect(matcher.match([])).toEqual([]);
  });

  it('keeps all weights when duplicate keys strengthen different boundaries', () => {
    const matcher = preparePatternMatcher(['a3b1c', 'a1b4c', 'a0b0c']);

    expect(matcher.match(Array.from('abcd'))).toEqual([1]);
  });

  it('matches Unicode code points rather than UTF-16 code units', () => {
    const matcher = preparePatternMatcher(['ё1л', '𐐨3𐐩']);

    expect(matcher.match(Array.from('ёлка'))).toEqual([1]);
    expect(matcher.match(Array.from('𐐨𐐩𐐪'))).toEqual([1]);
  });

  it('retains literal compound separators in patterns', () => {
    const matcher = preparePatternMatcher(['a-1b']);

    expect(matcher.match(Array.from('a-bc'))).toEqual([2]);
  });

  it('uses implicit zero weights and returns positions in increasing order', () => {
    const matcher = preparePatternMatcher(['abcd', 'c1d', 'a1b']);

    expect(matcher.match(Array.from('abcd'))).toEqual([1, 3]);
  });

  it('snapshots supplied patterns and keeps calls independent', () => {
    const patterns = ['a1b'];
    const matcher = preparePatternMatcher(patterns);
    patterns[0] = 'a2b';
    patterns.push('b1c');
    const positions = matcher.match(Array.from('abcd'));
    positions.push(2);

    expect(matcher.match(Array.from('abcd'))).toEqual([1]);
    expect(matcher.match(Array.from('zzzz'))).toEqual([]);
    expect(Object.isFrozen(matcher)).toBe(true);
  });

  it('accepts an empty pattern table as a valid no-break matcher', () => {
    expect(preparePatternMatcher([]).match(Array.from('abcd'))).toEqual([]);
  });

  it.each(['', '123', '.', '..', 'a12b', 'a.b', 'a b', 'a\nb', '\\patterns', '{ab}', 'a\uD800b'])(
    'rejects malformed pattern %j during preparation',
    (pattern) => {
      expect(() => preparePatternMatcher([pattern])).toThrow(TypeError);
    },
  );
});
