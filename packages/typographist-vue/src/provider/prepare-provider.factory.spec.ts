import { Typographist } from '@elmenov-softworks/typographist';
import type { TextRule, TextRuleSettings, TypographistConfig } from '@elmenov-softworks/typographist';

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
