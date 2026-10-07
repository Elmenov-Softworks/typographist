import { createAlphabetNormalizer } from '@/languages/analysis/alphabet-normalizer.factory.js';
import type { KnuthLiangPlugin } from '@/algorithms/knuth-liang/knuth-liang-plugin.types.js';
import { prepareKnuthLiang } from '@/algorithms/knuth-liang/prepare-knuth-liang.factory.js';

const normalize = createAlphabetNormalizer('abcdefghijklmnopqrstuvwxyzё');
const plugin: KnuthLiangPlugin = {
  id: 'test-US',
  normalize,
  leftMin: 1,
  rightMin: 1,
  patterns: ['a1b'],
};
const analysis = { symbols: ['a', 'b', 'c', 'd'], boundaries: [0, 1, 2, 3, 4] };

describe('prepareKnuthLiang', () => {
  it('registers only supplied languages and resolves identifiers without region fallback', () => {
    const engine = prepareKnuthLiang([plugin]);

    expect(engine.languages.map(({ id }) => id)).toEqual(['test-US']);
    expect(engine.wordBreaks('abcd', 'TEST-us', analysis)).toEqual([1]);
    expect(() => engine.wordBreaks('abcd', 'test', analysis)).toThrow(RangeError);
    expect(() => prepareKnuthLiang([plugin, { ...plugin, id: 'TEST-us' }])).toThrow(RangeError);
  });

  it.each(['', ' test', 'test ', '-test', 'test-', 'test--US', 'тест'])('rejects identifier %j', (id) => {
    expect(() => prepareKnuthLiang([{ ...plugin, id }])).toThrow(TypeError);
  });

  it.each([0, -1, NaN, Infinity, 1.5])('rejects invalid profile minima %j', (leftMin) => {
    expect(() => prepareKnuthLiang([{ ...plugin, leftMin }])).toThrow(RangeError);
  });

  it('snapshots pattern data, profile metadata, and normalized exceptions', () => {
    const patterns = ['a1b'];
    const positions = [2];
    const exceptions = [{ word: 'abcd', positions }];
    const mutable = { ...plugin, patterns, exceptions };
    const engine = prepareKnuthLiang([mutable]);
    const profile = engine.languages[0];

    if (profile === undefined) throw new Error('Missing prepared profile');

    patterns[0] = 'a2b';
    positions[0] = 1;
    exceptions.length = 0;
    mutable.id = 'changed';
    mutable.leftMin = 9;

    expect(engine.wordBreaks('abcd', 'test-US', analysis)).toEqual([1]);
    expect(profile.id).toBe('test-US');
    expect(profile.leftMin).toBe(1);
    expect(profile.exceptionBreaks(analysis)).toEqual([2]);
    expect(Object.isFrozen(engine)).toBe(true);
    expect(Object.isFrozen(engine.languages)).toBe(true);
    expect(Object.isFrozen(profile)).toBe(true);
  });

  it('maps original offsets and discards boundaries inside normalization expansions', () => {
    const engine = prepareKnuthLiang([{ ...plugin, patterns: ['a1b', 'b1c'] }]);

    expect(
      engine.wordBreaks('original', plugin.id, {
        symbols: ['a', 'b', 'c'],
        boundaries: [0, null, 4, 8],
      }),
    ).toEqual([4]);
  });

  it('uses replacement plugins and independent prepared indexes', () => {
    const first = prepareKnuthLiang([plugin]);
    const replacement = prepareKnuthLiang([{ ...plugin, patterns: ['b1c'] }]);

    expect(first.wordBreaks('abcd', plugin.id, analysis)).toEqual([1]);
    expect(replacement.wordBreaks('abcd', plugin.id, analysis)).toEqual([2]);
    expect(first.wordBreaks('abcd', plugin.id, analysis)).toEqual([1]);
  });

  it('validates plugin exceptions during preparation', () => {
    expect(() => prepareKnuthLiang([{ ...plugin, exceptions: [{ word: 'abcd', positions: [1, 1] }] }])).toThrow(
      RangeError,
    );
  });
});
