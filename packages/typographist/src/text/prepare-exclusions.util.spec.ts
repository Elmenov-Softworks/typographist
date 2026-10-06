import { prepareExclusions } from './prepare-exclusions.util.js';

describe('prepared exclusions', () => {
  it.each([
    null,
    [],
    'invalid',
    { numbers: 0 },
    { underscores: null },
    { camelCase: 'false' },
    { addresses: 1 },
    { custom: true },
  ])('rejects malformed options %j', (options) => {
    expect(() => prepareExclusions(options)).toThrow(TypeError);
  });

  it.each([() => Promise.resolve(false), () => null, () => 1])('rejects non-boolean custom results', (custom) => {
    const options = { custom };
    expect(() => {
      prepareExclusions(options).preserves('word');
    }).toThrow(TypeError);
  });

  it.each(['12345', 'v2', 'ISO9001', 'user_name', 'userName', 'UserName', 'имяПоля'])(
    'preserves technical token %s by default',
    (word) => {
      expect(prepareExclusions().preserves(word)).toBe(true);
    },
  );

  it.each(['Natural', 'NATURAL', 'природа', 'ПРИРОДА', 'mother', 'е\u0308лка'])('permits natural word %s', (word) => {
    expect(prepareExclusions().preserves(word)).toBe(false);
  });

  it('allows each configurable category to be disabled', () => {
    const policy = prepareExclusions({ addresses: false, numbers: false, underscores: false, camelCase: false });

    expect(policy.addresses).toBe(false);
    for (const word of ['v2', 'user_name', 'userName']) {
      expect(policy.preserves(word)).toBe(false);
    }
  });

  it('preserves manual opportunities and non-breaking compounds before custom callbacks', () => {
    const custom = vi.fn(() => false);
    const policy = prepareExclusions({ numbers: false, underscores: false, camelCase: false, custom });

    expect(policy.preserves('пе\u00adренос')).toBe(true);
    expect(policy.preserves('mother\u2011in\u2011law')).toBe(true);
    expect(custom).not.toHaveBeenCalled();
  });

  it('calls custom predicates only after built-in exclusions', () => {
    const custom = vi.fn((word: string) => word === 'private');
    const policy = prepareExclusions({ custom });

    expect(policy.preserves('userName')).toBe(true);
    expect(policy.preserves('private')).toBe(true);
    expect(policy.preserves('public')).toBe(false);
    expect(custom.mock.calls).toEqual([['private'], ['public']]);
  });

  it('snapshots caller options and isolates policies', () => {
    const options = { numbers: true, custom: () => false };
    const policy = prepareExclusions(options);
    options.numbers = false;
    options.custom = () => true;

    expect(policy.preserves('v2')).toBe(true);
    expect(policy.preserves('word')).toBe(false);
    expect(prepareExclusions(options).preserves('word')).toBe(true);
    expect(Object.isFrozen(policy)).toBe(true);
  });

  it('allows reentrant custom callbacks without shared working state', () => {
    const inner = prepareExclusions();
    const outer = prepareExclusions({ custom: (word: string) => inner.preserves(`${word}2`) });

    expect(outer.preserves('word')).toBe(true);
    expect(inner.preserves('word')).toBe(false);
  });

  it('propagates custom errors', () => {
    const error = new Error('predicate failed');
    const policy = prepareExclusions({
      custom: () => {
        throw error;
      },
    });

    expect(() => policy.preserves('word')).toThrow(error);
  });
});
