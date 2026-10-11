import { Typographist, TypographistRules } from '#src/index.js';
import * as matching from '#src/algorithms/knuth-liang/pattern-matcher.util.js';

const common = { locale: 'en', alphabet: 'abc', leftMin: 1, rightMin: 1 };
const rules = (patterns: readonly string[], leftMin = 1) =>
  new TypographistRules({
    standard: { ...common, patterns, leftMin },
    fast: { ...common, vowels: 'a', consonants: 'bc', specialLetters: '' },
  });

afterEach(() => vi.restoreAllMocks());

describe('disabled hyphenation', () => {
  it('validates rules without constructing the pattern matcher', () => {
    const prepare = vi.spyOn(matching, 'preparePatternMatcher');
    const plugin = rules(['a1b']);
    const compile = vi.spyOn(plugin, 'compile');
    const instance = new Typographist({ rules: [plugin], categories: ['quotes'] });

    expect(instance.format('"abc"')).toBe('“\u202fabc\u202f”');
    expect(prepare).not.toHaveBeenCalled();
    expect(compile).toHaveBeenCalledExactlyOnceWith(false);
    new Typographist({ rules: [plugin], categories: ['hyphenation'] });
    expect(prepare).toHaveBeenCalledOnce();
  });

  it.each([{ categories: [] }, { categories: ['quotes'] }] as const)(
    'retains validation for categories $categories',
    ({ categories }) => {
      expect(() => new Typographist({ rules: [rules(['a12b'])], categories })).toThrow('single-digit');
      expect(() => new Typographist({ rules: [rules(['a1b'], -1)], categories })).toThrow();
    },
  );
});
