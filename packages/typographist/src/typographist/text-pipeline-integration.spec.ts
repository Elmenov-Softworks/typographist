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
      settings: { 'ru/dash/years': { dash: '—' }, 'common/space/afterComma': {} },
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

  it('validates rule settings through the service boundary', () => {
    expect(() => new Typographist({ textRules: [spacing], settings: { missing: {} } })).toThrow('Unknown text rule');
    expect(() => {
      Reflect.construct(Typographist, [{ categories: ['unknown'] }]);
    }).toThrow('Invalid formatting categories');
  });
});
