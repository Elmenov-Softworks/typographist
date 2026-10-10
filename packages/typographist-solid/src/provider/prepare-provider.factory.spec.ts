import { Typographist } from '@elmenov-softworks/typographist';
import type { TextLocale, TextRule, TextRuleSettings, TypographistConfig } from '@elmenov-softworks/typographist';

import { prepareProvider } from '@/provider/prepare-provider.factory.js';

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
