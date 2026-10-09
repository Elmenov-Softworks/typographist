import { Typographist } from '@/typographist/typographist.js';
import type { TextRule } from '@/text/typography/text-rule.types.js';

const spacing: TextRule = {
  id: 'custom/spacing',
  category: 'spacing',
  order: 1,
  defaults: {},
  prepare: () => (text) => text.replaceAll('  ', ' '),
};

describe('service text pipeline', () => {
  it('applies consumer locale settings alongside bundled algorithm locales', () => {
    const custom: TextRule = {
      ...spacing,
      defaults: { separator: ' ' },
      prepare:
        ({ separator }) =>
        (text) =>
          text.replaceAll('  ', String(separator)),
    };
    const service = new Typographist<'custom'>({
      categories: ['spacing'],
      settings: { 'custom/spacing': { separator: '_' } },
      textLocales: [{ locale: 'custom', textRules: [custom] }],
    });

    expect(service.format('A  B', 'custom')).toBe('A_B');
    expect(service.format('A  B', 'en')).toBe('A  B');
    expect(service.format('A  B', 'ru')).toBe('A  B');
    expect(
      () =>
        new Typographist<'custom'>({
          textLocales: [{ locale: 'custom', textRules: [custom] }],
          settings: { 'custom/missing': {} },
        }),
    ).toThrow('Unknown text rule');
  });

  it('keeps distinct configurable rules owned by multiple typography-only locales', () => {
    const first: TextRule = {
      ...spacing,
      id: 'first/spacing',
      defaults: { separator: ' ' },
      prepare:
        ({ separator }) =>
        (text) =>
          text.replaceAll('  ', String(separator)),
    };
    const second: TextRule = { ...first, id: 'second/spacing' };
    const service = new Typographist<'first' | 'second'>({
      locale: 'first',
      rules: [],
      categories: ['spacing'],
      textLocales: [
        { locale: 'first', textRules: [first] },
        { locale: 'second', textRules: [second] },
      ],
      settings: {
        'first/spacing': { separator: '_' },
        'second/spacing': { separator: '/' },
      },
    });

    expect(service.format('A  B')).toBe('A_B');
    expect(service.format('A  B', 'second')).toBe('A/B');
    service.addTextLocale({ locale: 'first', textRules: [first] });
    expect(service.format('A  B')).toBe('A_B');
    expect(service.format('A  B', 'second')).toBe('A/B');
  });

  it.each(['', 'spacing', new Set(['spacing']), new Map([['spacing', true]])])(
    'rejects non-array categories at construction: %s',
    (categories) => {
      expect(() => {
        Reflect.construct(Typographist, [{ categories }]);
      }).toThrow('Invalid formatting categories');
    },
  );

  it.each(['table', new Set(['table']), new Map([['table', true]])])(
    'rejects non-array protected content at construction: %s',
    (protectedContent) => {
      expect(() => {
        Reflect.construct(Typographist, [{ protectedContent }]);
      }).toThrow('Protected content must be an array');
    },
  );

  it('applies Russian range settings with both default bundled locales registered', () => {
    const service = new Typographist({
      categories: ['dashes'],
      settings: { 'ru/dash/years': { dash: '—' } },
    });

    expect(service.format('2020-2025 гг.', 'ru')).toBe('2020—2025 гг.');
    expect(service.format('2020-2025 гг.', 'en')).toBe('2020-2025 гг.');
    expect(service.format('word - word', 'en')).toBe('word\u00a0— word');
  });

  it('keeps bundled settings from supplying capabilities to consumer typography-only locales', () => {
    const service = new Typographist<'custom'>({
      categories: ['dashes', 'spacing'],
      settings: { 'ru/dash/years': { dash: '—' } },
      textLocales: [{ locale: 'custom', textRules: [spacing] }],
    });

    expect(service.format('2020-2025 гг.  word,word', 'custom')).toBe('2020-2025 гг. word,word');
    expect(service.format('2020-2025 гг.', 'ru')).toBe('2020—2025 гг.');
    service.addTextLocale({ locale: 'custom', textRules: [spacing] });
    expect(service.format('word  word', 'custom')).toBe('word word');
  });

  it('rejects genuinely unknown bundled IDs and invalid locale setting names', () => {
    expect(() => new Typographist({ settings: { 'ru/dash/unknown': { dash: '—' } } })).toThrow('Unknown text rule');
    expect(() => new Typographist({ settings: { 'ru/dash/years': { unknown: '—' } } })).toThrow('Invalid setting');
    expect(() => new Typographist({ settings: { 'ru/dash/years': { dash: 'invalid' } } })).toThrow(
      'dash must be a supported',
    );
  });

  it('runs selected text rules without hyphenation', () => {
    const service = new Typographist({ textRules: [spacing], categories: ['spacing'] });

    expect(service.format('table  table')).toBe('table table');
  });

  it('applies typography before the selected hyphenation algorithm', () => {
    for (const useFast of [false, true]) {
      const legacy = new Typographist({ useFast, categories: ['hyphenation'] });
      const combined = new Typographist({ useFast, textRules: [spacing] });

      expect(combined.format('table  table')).toBe(legacy.format('table table'));
    }
  });

  it('disables every transformation while retaining input and locale validation', () => {
    const service = new Typographist({ categories: [], textRules: [spacing] });

    expect(service.format('table  table')).toBe('table  table');
    expect(() => service.format('', 'ru')).not.toThrow();
    expect(() => {
      Reflect.apply(service.format.bind(service), service, [42]);
    }).toThrow('Text must be a string');
    expect(() => {
      Reflect.apply(service.format.bind(service), service, ['', 'missing']);
    }).toThrow('Unregistered locale');
  });

  it('preserves configured content through typography and hyphenation', () => {
    const service = new Typographist({ textRules: [spacing], protectedContent: ['table  table'] });
    const legacy = new Typographist({ categories: ['hyphenation'] });

    expect(service.format('table  table other')).toBe(`table  table ${legacy.format('other')}`);
  });

  it.each([42, true, false, null, 'settings', [], () => null])(
    'rejects malformed outer settings maps: %s',
    (settings) => {
      expect(() => {
        Reflect.construct(Typographist, [{ settings }]);
      }).toThrow('Text rule settings must be a non-null, non-array object');
    },
  );

  it.each([42, true, false, null, 'settings', [], () => null, undefined])(
    'rejects malformed per-rule settings maps even with no categories selected: %s',
    (overrides) => {
      expect(() => {
        Reflect.construct(Typographist, [{ categories: [], settings: { 'ru/dash/years': overrides } }]);
      }).toThrow('Settings for text rule ru/dash/years must be a non-null, non-array object');
    },
  );

  it('validates rule settings through the service boundary', () => {
    expect(() => new Typographist({ textRules: [spacing], settings: { missing: {} } })).toThrow('Unknown text rule');
    expect(() => {
      Reflect.construct(Typographist, [{ categories: ['unknown'] }]);
    }).toThrow('Invalid formatting categories');
  });
});
