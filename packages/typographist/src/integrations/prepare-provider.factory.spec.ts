import { Typographist, TypographistRules } from '#src/index.js';
import type { TextLocale, TextRule, TextRuleSettings, TypographistConfig } from '#src/index.js';

import { prepareProvider } from '#src/integrations/prepare-provider.factory.js';

const createRule = () => {
  const rule: TextRule = {
    id: 'suffix',
    category: 'spacing',
    order: 0,
    defaults: { suffix: '!' },
    prepare: vi.fn((settings: TextRuleSettings) => (text: string) => text + String(settings.suffix)),
  };

  return rule;
};

describe('provider preparation', () => {
  it('preserves prepared state for fresh equivalent containers and explicit core defaults', () => {
    const initial = prepareProvider({});
    const next = prepareProvider(
      {
        locale: 'en',
        unsupportedLocale: 'throw',
        useFast: false,
        cacheSize: 64,
        categories: ['quotes', 'dashes', 'punctuation', 'nonbreakingSpacing', 'hyphenation'],
        excludedWords: [],
        protectedContent: [],
        textLocales: [],
        textRules: [],
        settings: {},
      },
      initial,
    );

    expect(next).toBe(initial);
  });

  it('compares primitive settings by value and prepares again when effective settings change', () => {
    const rule = createRule();
    const config: TypographistConfig = {
      categories: ['spacing'],
      textRules: [rule],
      settings: { suffix: { suffix: '?' } },
    };
    const initial = prepareProvider(config);
    const preparationCount = vi.mocked(rule.prepare).mock.calls.length;
    const equivalent = prepareProvider(
      { ...config, categories: ['spacing'], textRules: [rule], settings: { suffix: { suffix: '?' } } },
      initial,
    );

    expect(equivalent).toBe(initial);
    expect(rule.prepare).toHaveBeenCalledTimes(preparationCount);

    const changed = prepareProvider({ ...config, settings: { suffix: { suffix: '.' } } }, equivalent);

    expect(changed.formatter.format('source')).toBe('source.');
    expect(initial.formatter.format('source')).toBe('source?');
    expect(config.settings).toEqual({ suffix: { suffix: '?' } });
  });

  it('preserves omitted categories for typography-only locales and rejects explicit hyphenation', () => {
    const definition: TextLocale<'custom'> = { locale: 'custom', textRules: [] };
    const config: TypographistConfig<'custom'> = { locale: 'custom', textLocales: [definition] };
    const initial = prepareProvider(config);
    const replacement: TypographistConfig<'custom'> = {
      ...config,
      categories: ['quotes', 'dashes', 'punctuation', 'nonbreakingSpacing', 'hyphenation'],
    };

    expect(prepareProvider({ ...config, textLocales: [definition] }, initial)).toBe(initial);
    expect(() => new Typographist(replacement)).toThrow('has no hyphenation data');
    expect(() => prepareProvider(replacement, initial)).toThrow('has no hyphenation data');
    expect(initial.formatter.format('source')).toBe('source');
    expect(prepareProvider(config, initial)).toBe(initial);
  });

  it.each(['shared', 'locale'])('reuses declared %s rule defaults without preparing again', (ownership) => {
    const rule = createRule();
    const config: TypographistConfig<'custom'> = {
      locale: 'custom',
      categories: ['spacing'],
      textLocales: [{ locale: 'custom', textRules: ownership === 'locale' ? [rule] : [] }],
      textRules: ownership === 'shared' ? [rule] : [],
    };
    const initial = prepareProvider(config);
    const explicit = { ...config, settings: { suffix: { suffix: '!' } } };

    expect(initial.formatter.format('source')).toBe(new Typographist(explicit).format('source'));
    const countAfterCoreComparison = vi.mocked(rule.prepare).mock.calls.length;
    expect(prepareProvider(explicit, initial)).toBe(initial);
    expect(prepareProvider({ ...config, settings: { suffix: {} } }, initial)).toBe(initial);
    expect(vi.mocked(rule.prepare).mock.calls.length).toBe(countAfterCoreComparison);
    const explicitInitial = prepareProvider(explicit);

    expect(prepareProvider(config, explicitInitial)).toBe(explicitInitial);
    expect(config.settings).toBeUndefined();
    expect(rule.defaults).toEqual({ suffix: '!' });

    const changed = prepareProvider({ ...config, settings: { suffix: { suffix: '?' } } }, initial);

    expect(changed.formatter).not.toBe(initial.formatter);
    expect(changed.formatter.format('source')).toBe('source?');
    expect(() => prepareProvider({ ...config, settings: { suffix: { unknown: '!' } } }, initial)).toThrow();
  });

  it('replaces handler-bearing plugins by identity', () => {
    const initial = prepareProvider({ categories: ['spacing'], textRules: [createRule()] });
    const changed = prepareProvider({ categories: ['spacing'], textRules: [createRule()] }, initial);

    expect(changed.formatter).not.toBe(initial.formatter);
  });

  it('retains the previous valid service when replacement preparation throws', () => {
    const initial = prepareProvider({ locale: 'en' });
    const expected = initial.formatter.format('configuration');

    expect(() => prepareProvider({ cacheSize: -1 }, initial)).toThrow();
    expect(initial.formatter.format('configuration')).toBe(expected);
    expect(prepareProvider({ locale: 'en' }, initial)).toBe(initial);
  });

  it('isolates provider services and forwards configuration to the public core', () => {
    const config: TypographistConfig = { locale: 'ru', useFast: true, cacheSize: 0, categories: ['hyphenation'] };
    const first = prepareProvider(config);
    const second = prepareProvider(config);

    expect(first.formatter).not.toBe(second.formatter);
    expect(first.formatter.format('машина')).toBe(new Typographist(config).format('машина'));
    expect(first.formatter.format('table', 'en')).toBe(new Typographist(config).format('table', 'en'));
  });
});

it('compares quote glyph defaults for the registered typography-only locale', () => {
  const config: TypographistConfig = { rules: [], locale: 'en', textLocales: [{ locale: 'en', textRules: [] }] };
  const initial = prepareProvider(config);
  const explicit = { ...config, settings: { 'common/punctuation/quote': { left: '“‘' } } };
  expect(prepareProvider(explicit, initial)).toBe(initial);
  const explicitInitial = prepareProvider(explicit);
  expect(prepareProvider(config, explicitInitial)).toBe(explicitInitial);
  expect(() =>
    prepareProvider({ ...config, settings: { 'common/punctuation/quote': { unknown: true } } }, initial),
  ).toThrow();
});

it.each(['en', 'ru'] as const)('retains explicit %s plugin registration defaults without recompilation', (locale) => {
  const plugin = new TypographistRules({
    standard: { locale, alphabet: 'abcd', leftMin: 1, rightMin: 1, patterns: ['a1b'] },
    fast: { locale, alphabet: 'abcd', leftMin: 1, rightMin: 1, vowels: 'a', consonants: 'bcd', specialLetters: '' },
  });
  const compile = vi.spyOn(plugin, 'compile');
  const config: TypographistConfig = { locale, rules: [plugin] };
  const explicit = {
    ...config,
    settings: {
      'common/punctuation/quote': {
        left: locale === 'en' ? '“‘' : '«„‚',
        right: locale === 'en' ? '”’' : '»“‘',
        spacing: true,
      },
    },
  };
  const initial = prepareProvider(config);
  expect(compile).toHaveBeenCalledExactlyOnceWith(false);
  expect(prepareProvider(explicit, initial)).toBe(initial);
  expect(compile).toHaveBeenCalledTimes(1);
  expect(initial.config.rules?.[0]).toBe(plugin);
  expect(initial.formatter.format('"abcd"')).toBe(new Typographist(explicit).format('"abcd"'));

  const explicitInitial = prepareProvider(explicit);
  const count = compile.mock.calls.length;
  expect(prepareProvider(config, explicitInitial)).toBe(explicitInitial);
  expect(compile).toHaveBeenCalledTimes(count);
  expect(() =>
    prepareProvider({ ...config, settings: { 'common/punctuation/quote': { unknown: true } } }, initial),
  ).toThrow();
  expect(prepareProvider(config, initial)).toBe(initial);

  const fast = prepareProvider({ ...config, useFast: true }, initial);
  expect(fast).not.toBe(initial);
  expect(compile).toHaveBeenLastCalledWith(true);
  expect(config.rules?.[0]).toBe(plugin);
});

it('reuses custom-only rules sharing inactive bundled IDs in both directions', () => {
  const rule: TextRule = {
    id: 'ru/dash/years',
    category: 'dashes',
    order: 0,
    defaults: { dash: '—' },
    prepare: vi.fn((settings: TextRuleSettings) => (text: string) => text + String(settings.dash)),
  };
  const omitted: TypographistConfig<'custom'> = {
    rules: [],
    locale: 'custom',
    textLocales: [{ locale: 'custom', textRules: [rule] }],
  };
  const explicit = { ...omitted, settings: { 'ru/dash/years': { dash: '—' } } };

  for (const [initialConfig, replacement] of [
    [omitted, explicit],
    [explicit, omitted],
  ] as const) {
    const initial = prepareProvider(initialConfig);
    const expected = new Typographist(replacement).format('source');
    const preparationCount = vi.mocked(rule.prepare).mock.calls.length;

    expect(prepareProvider(replacement, initial)).toBe(initial);
    expect(rule.prepare).toHaveBeenCalledTimes(preparationCount);
    expect(initial.formatter.format('source')).toBe(expected);
    expect(() => prepareProvider({ ...omitted, settings: { 'ru/dash/years': { unknown: '—' } } }, initial)).toThrow();
    expect(() => prepareProvider({ ...omitted, settings: { 'ru/dash/years': { dash: 1 } } }, initial)).toThrow();
    expect(prepareProvider(initialConfig, initial)).toBe(initial);
  }
});

it.each([
  { settings: null },
  { settings: [] },
  { settings: { 'ru/dash/years': null } },
  { settings: { 'ru/dash/years': [] } },
  { settings: { 'common/punctuation/quote': null } },
  { settings: { 'common/punctuation/quote': [] } },
])('rejects invalid replacement settings through the core and retains prepared state: %j', (replacement) => {
  const configurations: TypographistConfig[] = [{}, { rules: [], textLocales: [{ locale: 'en', textRules: [] }] }];

  for (const config of configurations) {
    const initial = prepareProvider(config);
    const expected = initial.formatter.format('"source"');
    const invalidConfig = { ...config, ...replacement };
    const corePreparation = () => {
      Reflect.construct(Typographist, [invalidConfig]);
    };

    expect(corePreparation).toThrow(TypeError);

    try {
      corePreparation();
    } catch (error) {
      if (!(error instanceof TypeError)) {
        throw error;
      }

      expect(() => {
        Reflect.apply(prepareProvider, null, [invalidConfig, initial]);
      }).toThrow(error.message);
    }

    expect(initial.formatter.format('"source"')).toBe(expected);
    expect(prepareProvider(config, initial)).toBe(initial);
    expect(initial.config).toBe(config);
  }
});

it.each([
  ...[
    'cacheSize',
    'useFast',
    'locale',
    'categories',
    'excludedWords',
    'protectedContent',
    'textLocales',
    'textRules',
    'rules',
  ].map((field) => ({ [field]: null })),
  ...['categories', 'excludedWords', 'protectedContent', 'textLocales', 'textRules', 'rules'].flatMap((field) =>
    [false, 0, '', {}, { length: 0 }].map((value) => ({ [field]: value })),
  ),
  { cacheSize: '64' },
  { cacheSize: Number.NaN },
  { cacheSize: Infinity },
  { cacheSize: -1 },
  { locale: false },
  { categories: ['unknown'] },
  { excludedWords: [null] },
  { protectedContent: [''] },
  { protectedContent: [null] },
  { textLocales: [null] },
  { textLocales: [{ locale: 'custom', textRules: null }] },
  { textRules: [null] },
  { rules: [null] },
  { settings: false },
  { settings: { 'ru/dash/years': false } },
  Object.assign([], { rules: null }),
  Object.assign([], { rules: [] }),
  Object.assign(() => null, { rules: [] }),
  null,
  [],
  false,
  0,
  '',
])('preserves core errors and previous state for invalid JavaScript configuration: %j', (replacement) => {
  const config = {};
  const initial = prepareProvider(config);
  const expected = initial.formatter.format('"configuration"');
  let coreError: unknown = null;

  try {
    Reflect.construct(Typographist, [replacement]);
  } catch (error) {
    coreError = error;
  }

  expect(coreError).toBeInstanceOf(Error);

  if (!(coreError instanceof Error)) {
    throw new Error('Expected core preparation to reject the fixture');
  }

  let providerError: unknown = null;

  try {
    Reflect.apply(prepareProvider, null, [replacement, initial]);
  } catch (error) {
    providerError = error;
  }

  expect(providerError).toBeInstanceOf(coreError.constructor);
  expect(providerError).toHaveProperty('message', coreError.message);
  expect(initial.formatter.format('"configuration"')).toBe(expected);
  expect(initial.config).toBe(config);
  expect(prepareProvider({}, initial)).toBe(initial);
});

it.each([null, undefined])('does not reuse sparse exclusions for an explicit %s element', (element) => {
  const excludedWords = ['source'];
  Reflect.deleteProperty(excludedWords, '0');
  const config = { excludedWords };
  const initial = prepareProvider(config);
  const replacement = { excludedWords: [element] };
  const expected = initial.formatter.format('configuration');

  expect(() => {
    Reflect.construct(Typographist, [replacement]);
  }).toThrow(new TypeError('excludedWords must be an array of strings'));
  expect(() => {
    Reflect.apply(prepareProvider, null, [replacement, initial]);
  }).toThrow(new TypeError('excludedWords must be an array of strings'));
  expect(initial.formatter.format('configuration')).toBe(expected);
  expect(prepareProvider(config, initial)).toBe(initial);
});

it('ignores valid inactive bundled settings without recompiling and preserves core rejection', () => {
  const plugin = new TypographistRules({
    standard: { locale: 'en', alphabet: 'abcd', leftMin: 1, rightMin: 1, patterns: ['a1b'] },
    fast: {
      locale: 'en',
      alphabet: 'abcd',
      leftMin: 1,
      rightMin: 1,
      vowels: 'a',
      consonants: 'bcd',
      specialLetters: '',
    },
  });
  const compile = vi.spyOn(plugin, 'compile');
  const omitted: TypographistConfig = { rules: [plugin] };
  const explicit: TypographistConfig = { ...omitted, settings: { 'ru/dash/years': { dash: '–' } } };

  for (const [config, replacement] of [
    [omitted, explicit],
    [explicit, omitted],
  ] as const) {
    const initial = prepareProvider(config);
    const calls = compile.mock.calls.length;

    expect(prepareProvider(replacement, initial)).toBe(initial);
    expect(compile).toHaveBeenCalledTimes(calls);
    expect(() => prepareProvider({ ...config, settings: { 'ru/dash/years': { dash: 1 } } }, initial)).toThrow();
    expect(() => prepareProvider({ ...config, settings: { 'ru/dash/years': { unknown: '–' } } }, initial)).toThrow();
    expect(prepareProvider(config, initial)).toBe(initial);
  }
});

it('preserves custom defaults for rule IDs inherited by ordinary objects', () => {
  const rule = { ...createRule(), id: 'constructor' };
  const config: TypographistConfig = { categories: ['spacing'], textRules: [rule] };
  const initial = prepareProvider(config);
  const explicit = { ...config, settings: { constructor: { suffix: '!' } } };
  const expected = new Typographist(explicit).format('source');
  const preparations = vi.mocked(rule.prepare).mock.calls.length;

  expect(prepareProvider(explicit, initial)).toBe(initial);
  expect(rule.prepare).toHaveBeenCalledTimes(preparations);
  expect(initial.formatter.format('source')).toBe(expected);
});

it('prepares again when unsupported locale policy changes', () => {
  const initial = prepareProvider<'fr'>({ unsupportedLocale: 'preserve', locale: 'fr' });
  const equivalent = prepareProvider<'fr'>({ unsupportedLocale: 'preserve', locale: 'fr' }, initial);

  expect(equivalent).toBe(initial);
  expect(initial.formatter.format('source')).toBe('source');
  expect(() => prepareProvider<'fr'>({ unsupportedLocale: 'throw', locale: 'fr' }, initial)).toThrow(RangeError);

  // @ts-expect-error Runtime policy validation must also apply during updates.
  expect(() => prepareProvider({ unsupportedLocale: null }, prepareProvider({}))).toThrow(TypeError);
});

it('selects bundled Chinese through the shared provider', () => {
  const provider = prepareProvider({ locale: 'zh' });

  expect(provider.registrationLocales).toContain('zh');
  expect(provider.formatter.format('"中文" typography')).toBe('“中文” typography');
  expect(prepareProvider({ locale: 'zh' }, provider)).toBe(provider);
});
