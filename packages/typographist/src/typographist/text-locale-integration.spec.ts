import { Typographist } from '@/typographist/typographist.js';
import type { TextRule } from '@/text/typography/text-rule.types.js';

const spacing: TextRule = {
  id: 'custom/spacing',
  category: 'spacing',
  order: 1,
  defaults: {},
  prepare: () => (text) => text.replaceAll('  ', ' '),
};

describe('typography-only locales', () => {
  it.each([
    ['«', '»'],
    ['「', '」'],
  ])('uses consumer quotation data %s %s after shared spacing at equal priority', (opening, closing) => {
    const quotes: TextRule = {
      id: 'custom/quotes',
      category: 'quotes',
      order: spacing.order,
      defaults: { opening, closing },
      prepare: (settings) => {
        const { opening, closing } = settings;

        if (typeof opening !== 'string' || typeof closing !== 'string') {
          throw new TypeError('Quotation pairs must be strings');
        }

        return (text) => text.replace(/"([^" ]+ [^" ]+)"/g, `${opening}$1${closing}`);
      },
    };
    const service = new Typographist({
      locale: 'custom',
      rules: [],
      textRules: [spacing],
      textLocales: [{ locale: 'custom', textRules: [quotes] }],
      protectedContent: ['"Keep  Case"'],
    });

    expect(service.format('"猫  犬" "Keep  Case" https://example.com a@b.com')).toBe(
      `${opening}猫 犬${closing} "Keep  Case" https://example.com a@b.com`,
    );
  });

  it.each([null, 42, false, {}, Promise.resolve('text')])('rejects invalid custom handler result %s', (result) => {
    const handler = vi.fn().mockReturnValueOnce(result).mockReturnValue('valid');
    const service = new Typographist({
      locale: 'custom',
      rules: [],
      textLocales: [{ locale: 'custom', textRules: [{ ...spacing, prepare: () => handler }] }],
    });

    expect(() => service.format('text')).toThrow('must return a string synchronously');
    expect(service.format('text')).toBe('valid');
  });

  it.each([false, true])('applies available capabilities without algorithm data (useFast=%s)', (useFast) => {
    const service = new Typographist({
      locale: 'custom',
      useFast,
      rules: [],
      textLocales: [{ locale: 'custom', textRules: [spacing] }],
    });

    expect(service.format('Abc  Abc')).toBe('Abc Abc');
    expect(service.format('')).toBe('');
    expect(() => service.format('', 'en')).toThrow('Unregistered locale');
  });

  it('rejects explicit hyphenation requests without fabricating data', () => {
    expect(
      () =>
        new Typographist({
          locale: 'custom',
          rules: [],
          categories: ['hyphenation'],
          textLocales: [{ locale: 'custom', textRules: [spacing] }],
        }),
    ).toThrow('has no hyphenation data');
  });

  it('preserves the old locale after a failed replacement and accepts valid replacement', () => {
    const service = new Typographist({
      locale: 'custom',
      textLocales: [{ locale: 'custom', textRules: [spacing] }],
    });

    expect(() => {
      service.addTextLocale({ locale: 'custom', textRules: [spacing, spacing] });
    }).toThrow('unique');
    expect(service.format('Abc  Abc')).toBe('Abc Abc');

    service.addTextLocale({ locale: 'custom', textRules: [] });

    expect(service.format('Abc  Abc')).toBe('Abc  Abc');
    expect(service.removeRules('custom')).toBe(true);
    expect(() => service.format('')).toThrow('Unregistered locale');
  });

  it('retains all-disabled behavior and protects addresses and configured literals', () => {
    const definition = { locale: 'custom', textRules: [spacing] };
    const disabled = new Typographist({ locale: 'custom', textLocales: [definition], categories: [] });
    const protectedService = new Typographist({
      locale: 'custom',
      textLocales: [definition],
      protectedContent: ['Abc  Abc'],
    });

    expect(disabled.format('Abc  Abc')).toBe('Abc  Abc');
    expect(protectedService.format('Abc  Abc  https://example.com  a@b.com')).toBe(
      'Abc  Abc https://example.com a@b.com',
    );
  });

  it('rejects duplicate registration keys across both capability kinds', () => {
    expect(() => new Typographist({ textLocales: [{ locale: 'EN', textRules: [] }] })).toThrow('Duplicate locale');
  });
});
