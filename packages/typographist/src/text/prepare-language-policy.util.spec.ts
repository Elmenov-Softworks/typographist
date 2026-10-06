import { prepareKnuthLiang } from '../algorithms/knuth-liang/prepare-knuth-liang.factory.js';
import { createAlphabetNormalizer } from '../languages/word-analysis.util.js';
import { prepareLanguagePolicy } from './prepare-language-policy.util.js';

const engine = prepareKnuthLiang([
  {
    id: 'test',
    normalize: createAlphabetNormalizer('abcdefghijklmnopqrstuvwxyzёелка'),
    leftMin: 2,
    rightMin: 3,
    patterns: [],
    exceptions: [{ word: 'abcdef', positions: [2] }],
  },
]);
const profile = engine.languages[0];
if (profile === undefined) throw new Error('Missing test profile');

describe('prepareLanguagePolicy', () => {
  it.each([null, [], 'policy', 1])('rejects a malformed options object %j', (options) => {
    expect(() => {
      Reflect.apply(prepareLanguagePolicy, null, [profile, options]);
    }).toThrow(TypeError);
  });

  it.each(['leftMin', 'rightMin', 'minWordLength'])('rejects malformed %s values', (option) => {
    for (const value of [null, '2', false]) {
      expect(() => Reflect.apply(prepareLanguagePolicy, null, [profile, { [option]: value }])).toThrow(RangeError);
    }
  });

  it('uses profile minima and no extra length cutoff by default', () => {
    const policy = prepareLanguagePolicy(profile);

    expect(policy.leftMin).toBe(2);
    expect(policy.rightMin).toBe(3);
    expect(policy.minWordLength).toBe(0);
    expect(policy.exceptionBreaks({ symbols: ['a'], boundaries: [0, 1] })).toBeNull();
    expect(Object.isFrozen(policy)).toBe(true);
  });

  it('snapshots raised limits and user exceptions independently of plugin exceptions', () => {
    const positions = [3];
    const options = { leftMin: 3, rightMin: 4, minWordLength: 7, exceptions: [{ word: 'abcdef', positions }] };
    const policy = prepareLanguagePolicy(profile, options);
    const analysis = { symbols: ['a', 'b', 'c', 'd', 'e', 'f'], boundaries: [0, 1, 2, 3, 4, 5, 6] };

    options.leftMin = 9;
    positions[0] = 4;
    options.exceptions.length = 0;

    expect(policy.leftMin).toBe(3);
    expect(policy.rightMin).toBe(4);
    expect(policy.minWordLength).toBe(7);
    expect(policy.exceptionBreaks(analysis)).toEqual([3]);
    expect(profile.exceptionBreaks(analysis)).toEqual([2]);
    expect(prepareLanguagePolicy(profile).exceptionBreaks(analysis)).toBeNull();
  });

  it('distinguishes a user no-break exception from no matching exception', () => {
    const policy = prepareLanguagePolicy(profile, { exceptions: [{ word: 'abcdef', positions: [] }] });

    expect(
      policy.exceptionBreaks({ symbols: ['a', 'b', 'c', 'd', 'e', 'f'], boundaries: [0, 1, 2, 3, 4, 5, 6] }),
    ).toEqual([]);
    expect(policy.exceptionBreaks({ symbols: ['o', 't', 'h', 'e', 'r'], boundaries: [0, 1, 2, 3, 4, 5] })).toBeNull();
  });

  it('maps canonical equivalents through the same normalizer', () => {
    const policy = prepareLanguagePolicy(profile, { exceptions: [{ word: 'ёлка', positions: [2] }] });
    const analysis = profile.normalize('е\u0308лка');
    if (analysis === null) throw new Error('Unsupported test word');

    expect(policy.exceptionBreaks(analysis)).toEqual([3]);
  });

  it.each([NaN, Infinity, -Infinity, -1, 1.5, Number.MAX_SAFE_INTEGER + 1])('rejects invalid limits %j', (value) => {
    expect(() => prepareLanguagePolicy(profile, { leftMin: value })).toThrow(RangeError);
    expect(() => prepareLanguagePolicy(profile, { rightMin: value })).toThrow(RangeError);
    expect(() => prepareLanguagePolicy(profile, { minWordLength: value })).toThrow(RangeError);
  });

  it('rejects minima below the profile defaults and accepts exact limits', () => {
    expect(() => prepareLanguagePolicy(profile, { leftMin: 1 })).toThrow(RangeError);
    expect(() => prepareLanguagePolicy(profile, { rightMin: 2 })).toThrow(RangeError);
    expect(prepareLanguagePolicy(profile, { leftMin: 2, rightMin: 3, minWordLength: 0 }).minWordLength).toBe(0);
  });

  it('validates exception tables when preparing the policy', () => {
    expect(() => prepareLanguagePolicy(profile, { exceptions: [{ word: 'abcdef', positions: [2, 2] }] })).toThrow(
      RangeError,
    );
    expect(() => prepareLanguagePolicy(profile, { exceptions: [{ word: 'unsupported!', positions: [] }] })).toThrow(
      TypeError,
    );
  });
});
