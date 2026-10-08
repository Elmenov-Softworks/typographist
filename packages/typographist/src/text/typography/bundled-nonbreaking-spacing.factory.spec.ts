import { createBundledNonbreakingSpacing } from '@/text/typography/bundled-nonbreaking-spacing.factory.js';
import { prepareTextPipeline } from '@/text/typography/prepare-text-pipeline.util.js';
import { Typographist } from '@/typographist/typographist.js';

describe('bundled nonbreaking mark spacing', () => {
  it.each(['en', 'ru'] as const)('matches isolated section-mark reference behavior for %s', (locale) => {
    const id = 'common/nbsp/afterSectionMark';
    const rules = createBundledNonbreakingSpacing(locale).filter((rule) => rule.id === id);
    const format = prepareTextPipeline(rules, locale);
    const space = locale === 'ru' ? '\u202f' : '\u00a0';
    const output = `§${space}1 §${space}2 §${space}3 §${space}4 §${space}I §${space}V §${space}X`;
    const unchanged = '§\t1 §  1 §\u202f1 §i §A §😀 §\n1 §\r1 §e\u0301 ¶1';

    expect(rules).toHaveLength(1);
    expect(format('§1 § 2 §\u00a03 §\u20094 §I § V §X')).toBe(output);
    expect(format(output)).toBe(output);
    expect(format(unchanged)).toBe(unchanged);
    expect(() => prepareTextPipeline(rules, locale, { settings: { [id]: { unknown: true } } })).toThrow(
      'Invalid setting',
    );
  });

  it.each(['en', 'ru'] as const)('matches isolated paragraph-mark reference behavior for %s', (locale) => {
    const id = 'common/nbsp/afterParagraphMark';
    const rules = createBundledNonbreakingSpacing(locale).filter((rule) => rule.id === id);
    const format = prepareTextPipeline(rules, locale);
    const input = '¶1 ¶ 2 ¶\u00a03 ¶\t4 ¶  5 ¶I ¶\u20096 ¶\u202f7 ¶\n8 ¶😀';
    const output = '¶\u00a01 ¶\u00a02 ¶\u00a03 ¶\t4 ¶  5 ¶I ¶\u20096 ¶\u202f7 ¶\n8 ¶😀';

    expect(rules).toHaveLength(1);
    expect(format(input)).toBe(output);
    expect(format(output)).toBe(output);
    expect(() => prepareTextPipeline(rules, locale, { settings: { [id]: { unknown: true } } })).toThrow(
      'Invalid setting',
    );
  });

  it.each(['en', 'ru'] as const)('selects mark spacing independently and preserves content for %s', (locale) => {
    const service = new Typographist({
      locale,
      categories: ['nonbreakingSpacing'],
      protectedContent: ['Keep §1 ¶2'],
    });
    const space = locale === 'ru' ? '\u202f' : '\u00a0';
    const content = '$100 100 руб. 12345 1.25 1/2 2026-10-08 +7-999-123-45-67 word word MiXeD мiкс e\u0301 😀';
    const protectedText = 'https://example.com/§1/¶2 user@example.com Keep §1 ¶2';
    const input = `${content} ${protectedText} §1.25 ¶1/2 §2026-10-08`;
    const output = `${content} ${protectedText} §${space}1.25 ¶\u00a01/2 §${space}2026-10-08`;

    expect(service.format(input)).toBe(output);
    expect(service.format(output)).toBe(output);
    expect(service.format('')).toBe('');
    expect(service.format(' \r\n\t\u00a0')).toBe(' \r\n\t\u00a0');
    expect(service.format('a\u00adb §1')).toBe(`a\u00adb §${space}1`);

    for (const categories of [[], ['spacing'], ['hyphenation']] as const) {
      expect(new Typographist({ locale, categories }).format('§1 ¶2')).toBe('§1 ¶2');
    }
  });

  it.each([false, true])('combines mark spacing before hyphenation with useFast=%s', (useFast) => {
    const service = new Typographist({ useFast });
    const legacy = new Typographist({ useFast, categories: ['hyphenation'] });
    const expected = legacy.format('§\u00a01 ¶\u00a02 [table word]');

    expect(service.format('§  1 ¶  2 [  table\tword  ]')).toBe(expected);
    expect(service.format(expected)).toBe(expected);
  });

  it('does not supply implicit rules to consumer locales', () => {
    expect(createBundledNonbreakingSpacing('custom')).toEqual([]);

    const service = new Typographist({
      categories: ['nonbreakingSpacing'],
      textLocales: [{ locale: 'custom', textRules: [] }],
    });

    expect(service.format('§1 ¶2', 'custom')).toBe('§1 ¶2');
  });
});
