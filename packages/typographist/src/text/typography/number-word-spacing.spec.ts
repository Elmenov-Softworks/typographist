import { createBundledNonbreakingSpacing } from '@/text/typography/bundled-nonbreaking-spacing.factory.js';
import { prepareTextPipeline } from '@/text/typography/prepare-text-pipeline.util.js';
import { Typographist } from '@/typographist/typographist.js';

describe('nonbreaking spacing after numbers', () => {
  const id = 'common/nbsp/afterNumber';

  it.each(['en', 'ru'] as const)('matches isolated reference boundaries for %s', (locale) => {
    const rules = createBundledNonbreakingSpacing(locale).filter((rule) => rule.id === id);
    const format = prepareTextPipeline(rules, locale);
    const word = locale === 'ru' ? 'СЛОВО' : 'WORD';

    expect(rules).toHaveLength(1);

    for (const prefix of ['', ' ', '\t', '\r', '\n', '\u00a0']) {
      for (const number of ['0', '1', '12345']) {
        const expected = `${prefix}${number}\u00a0${word}`;

        expect(format(`${prefix}${number} ${word}`)).toBe(expected);
        expect(format(expected)).toBe(expected);
      }
    }

    for (const number of ['123456', '1.25', '1/2', '2026-10-08', '-12', '+12', 'a12', '(12']) {
      expect(format(`${number} ${word}`)).toBe(`${number} ${word}`);
    }

    for (const space of ['\t', '\n', '\r', '\u00a0', '  ']) {
      expect(format(`12${space}${word}`)).toBe(`12${space}${word}`);
    }

    expect(format('12 😀 12 e\u0301 12 мiкс')).toBe(
      locale === 'ru' ? '12 😀 12 e\u0301 12\u00a0мiкс' : '12 😀 12\u00a0e\u0301 12 мiкс',
    );
    expect(() => prepareTextPipeline(rules, locale, { settings: { [id]: { unknown: true } } })).toThrow(
      'Invalid setting',
    );
  });

  it.each(['en', 'ru'] as const)('selects the category and preserves protected content for %s', (locale) => {
    const word = locale === 'ru' ? 'руб.' : 'items';
    const service = new Typographist({ locale, categories: ['nonbreakingSpacing'], protectedContent: [`12 ${word}`] });
    const content = '$100 12345 1.25 1/2 2026-10-08 +7-999-123-45-67 word word MiXeD мiкс';
    const protectedText = `https://example.com/12 user@example.com 12 ${word}`;

    expect(service.format(`${content} ${protectedText} 100 ${word}`)).toBe(
      `${content} ${protectedText} 100\u00a0${word}`,
    );
    expect(service.format('')).toBe('');
    expect(service.format(' \r\n\t\u00a0')).toBe(' \r\n\t ');

    for (const categories of [[], ['spacing'], ['hyphenation']] as const) {
      expect(new Typographist({ locale, categories, excludedWords: [word] }).format(`100 ${word}`)).toBe(`100 ${word}`);
    }
  });

  it.each([false, true])('runs after ordinary spacing and before hyphenation with useFast=%s', (useFast) => {
    const service = new Typographist({ useFast });
    const legacy = new Typographist({ useFast, categories: ['hyphenation'] });
    const expected = legacy.format('100\u00a0examples');

    expect(service.format('100  examples')).toBe(expected);
    expect(service.format(expected)).toBe(expected);
  });

  it('does not add rules to consumer locales', () => {
    expect(createBundledNonbreakingSpacing('custom')).toEqual([]);
    expect(new Typographist({ textLocales: [{ locale: 'custom', textRules: [] }] }).format('100 items', 'custom')).toBe(
      '100 items',
    );
  });
});
