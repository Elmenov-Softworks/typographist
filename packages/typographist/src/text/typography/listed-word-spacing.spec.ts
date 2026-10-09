import { createBundledNonbreakingSpacing } from '@/text/typography/bundled-nonbreaking-spacing.factory.js';
import { prepareTextPipeline } from '@/text/typography/prepare-text-pipeline.util.js';
import { Typographist } from '@/typographist/typographist.js';

describe('nonbreaking spacing after listed words', () => {
  const id = 'common/nbsp/afterShortWordByList';

  it.each(['en', 'ru'] as const)('matches listed-word reference boundaries for %s', (locale) => {
    const rules = createBundledNonbreakingSpacing(locale).filter((rule) => rule.id === id);
    const format = prepareTextPipeline(rules, locale);
    const words = locale === 'ru' ? ['без', 'если', 'для', 'под'] : ['and', 'the', 'for', 'via'];

    expect(rules).toHaveLength(1);

    for (const word of words) {
      for (const prefix of ['', ' ', '\u00a0', '(', '«', '”', '\n', '\r', '\r\n']) {
        expect(format(`${prefix}${word} example`)).toBe(`${prefix}${word}\u00a0example`);
        expect(format(`${prefix}${word.toUpperCase()} example`)).toBe(`${prefix}${word.toUpperCase()}\u00a0example`);
      }
      for (const prefix of ['x', '😀', '\t', ',', '[']) {
        expect(format(`${prefix}${word} example`)).toBe(`${prefix}${word} example`);
      }
      for (const suffix of ['\tword', '\nword', '\rword', '\u00a0word', ', word', 'x word', '']) {
        expect(format(`${word}${suffix}`)).toBe(`${word}${suffix}`);
      }
      const expected = `${word}\u00a0${word}\u00a0${word}\u00a0word`;

      expect(format(`${word} ${word} ${word} word`)).toBe(expected);
      expect(format(expected)).toBe(expected);
    }

    expect(format('')).toBe('');
    expect(format(' \r\n\t\u00a0')).toBe(' \r\n\t\u00a0');
    expect(() => prepareTextPipeline(rules, locale, { settings: { [id]: { unknown: true } } })).toThrow(
      'Invalid setting',
    );
  });

  it.each(['en', 'ru'] as const)('respects selection, protection and composition for %s', (locale) => {
    const word = locale === 'ru' ? 'если' : 'the';
    const protectedText = `${word} protected`;
    const service = new Typographist({ locale, categories: ['nonbreakingSpacing'], protectedContent: [protectedText] });
    const preserved = '$100 12345 1.25 1/2 2026-10-08 +7-999-123-45-67 word word MiXeD мiкс';
    const input = `${protectedText} https://example.com/${word} user@example.com ${word} ${preserved}`;

    expect(service.format(input)).toBe(
      `${protectedText} https://example.com/${word} user@example.com ${word}\u00a0${preserved}`,
    );

    for (const categories of [[], ['spacing'], ['hyphenation']] as const) {
      expect(new Typographist({ locale, categories, excludedWords: [word, 'example'] }).format(`${word} example`)).toBe(
        `${word} example`,
      );
    }
  });

  it.each([false, true])('combines ordinary spacing and hyphenation with useFast=%s', (useFast) => {
    const service = new Typographist({ useFast });
    const legacy = new Typographist({ useFast, categories: ['hyphenation'] });
    const expected = legacy.format('the\u00a0examples');

    expect(service.format('the examples')).toBe(expected);
    expect(service.format(expected)).toBe(expected);
  });

  it('does not supply lists to consumer locales', () => {
    expect(createBundledNonbreakingSpacing('custom')).toEqual([]);
    expect(
      new Typographist({ textLocales: [{ locale: 'custom', textRules: [] }] }).format('the example', 'custom'),
    ).toBe('the example');
  });
});
