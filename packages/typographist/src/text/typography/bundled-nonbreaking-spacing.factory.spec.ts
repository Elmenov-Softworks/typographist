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
    const output = `${locale === 'ru' ? content.replace('100 руб.', '100\u00a0руб.') : content} ${protectedText} §${space}1.25 ¶\u00a01/2 §${space}2026-10-08`;

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

describe('Russian nonbreaking particle spacing', () => {
  const id = 'ru/nbsp/beforeParticle';
  const rules = createBundledNonbreakingSpacing('ru').filter((rule) => rule.id === id);

  it.each([
    ['Он ли, она же! ты бы? я б: ёж ль» Я ж;', 'Он\u00a0ли, она\u00a0же! ты\u00a0бы? я\u00a0б: ёж\u00a0ль» Я\u00a0ж;'],
    [
      'Он ли тут она же там ты бы смог я б ушёл ёж ль спит Я ж тут',
      'Он\u00a0ли тут она\u00a0же там ты\u00a0бы смог я\u00a0б ушёл ёж\u00a0ль спит Я\u00a0ж тут',
    ],
    ['Он\u00a0ли\u00a0тут', 'Он\u00a0ли тут'],
    ['я бы он ли тут', 'я\u00a0бы он\u00a0ли тут'],
    ['Он ли. Он ли\nОн ли', 'Он ли. Он ли\nОн ли'],
    [
      'Он ЛИ тут a ли тут я  бы тут я\tбы тут я бы😀 e\u0301 бы тут',
      'Он ЛИ тут a ли тут я  бы тут я\tбы тут я бы😀 e\u0301 бы тут',
    ],
  ])('matches the isolated reference for %j', (input, expected) => {
    const format = prepareTextPipeline(rules, 'ru');

    expect(rules).toHaveLength(1);
    expect(format(input)).toBe(expected);
    expect(format(expected)).toBe(expected);
  });

  it('rejects settings and limits the rule to Russian', () => {
    expect(() => prepareTextPipeline(rules, 'ru', { settings: { [id]: { unknown: true } } })).toThrow(
      'Invalid setting',
    );
    expect(createBundledNonbreakingSpacing('en').some((rule) => rule.id === id)).toBe(false);
    expect(createBundledNonbreakingSpacing('custom')).toEqual([]);
    expect(new Typographist({ locale: 'en', categories: ['nonbreakingSpacing'] }).format('Он ли тут')).toBe(
      'Он ли тут',
    );
  });

  it('selects the category independently and preserves protected and lexical content', () => {
    const service = new Typographist({
      locale: 'ru',
      categories: ['nonbreakingSpacing'],
      protectedContent: ['Он ли тут'],
    });
    const content = '$100 100 руб. 12345 1.25 1/2 2026-10-08 +7-999-123-45-67 word word MiXeD мiкс e\u0301 😀';
    const protectedText = 'https://example.com/он user@example.com Он ли тут';

    expect(service.format(`${content} ${protectedText} она же там`)).toBe(
      `${content.replace('100 руб.', '100\u00a0руб.')} ${protectedText} она\u00a0же там`,
    );
    expect(service.format('')).toBe('');
    expect(service.format(' \r\n\t\u00a0')).toBe(' \r\n\t\u00a0');
    expect(service.format('а\u00adб бы тут')).toBe('а\u00adб\u00a0бы тут');

    for (const categories of [[], ['spacing'], ['hyphenation']] as const) {
      expect(new Typographist({ locale: 'ru', categories }).format('он ли тут')).toBe('он ли тут');
    }
  });

  it.each([false, true])('combines spacing and hyphenation with useFast=%s', (useFast) => {
    const service = new Typographist({ locale: 'ru', useFast });
    const legacy = new Typographist({ locale: 'ru', useFast, categories: ['hyphenation'] });
    const expected = legacy.format('проверка\u00a0бы работала');

    expect(service.format('проверка  бы работала')).toBe(expected);
    expect(service.format(expected)).toBe(expected);
  });
});

describe('nonbreaking spacing before short terminal numbers', () => {
  const id = 'common/nbsp/beforeShortLastNumber';

  it.each(['en', 'ru'] as const)('matches isolated reference boundaries for %s', (locale) => {
    const rules = createBundledNonbreakingSpacing(locale).filter((rule) => rule.id === id);
    const format = prepareTextPipeline(rules, locale);
    const word = locale === 'ru' ? 'Слово' : 'Word';
    const next = locale === 'ru' ? 'Далее' : 'Next';
    const quote = locale === 'ru' ? '»' : '”';

    expect(rules).toHaveLength(1);

    for (const suffix of ['', '.', '!', '?', '…', '%', '+', '-', '−', ')', "'", '"', quote]) {
      const expected = `${word}\u00a012${suffix}`;

      expect(format(`${word} 12${suffix}`)).toBe(expected);
      expect(format(expected)).toBe(expected);
    }

    expect(format(`${word} 1. ${next} 2!`)).toBe(`${word}\u00a01. ${next}\u00a02!`);
    expect(format(`${word} 1\r\n${word} 2\n`)).toBe(`${word}\u00a01\r\n${word}\u00a02\n`);

    for (const suffix of ['123', '1.25', '1/2', '2026-10-08', '12,', '12. next', '12. дальше', '12 words']) {
      expect(format(`${word} ${suffix}`)).toBe(`${word} ${suffix}`);
    }

    const unchanged = `123 12 😀 12 e\u0301 12 ${word}\t12 ${word}  12 ${word}\u00a012`;

    expect(format(unchanged)).toBe(unchanged);
    expect(format(locale === 'ru' ? 'Word 12' : 'Слово 12')).toBe(locale === 'ru' ? 'Word 12' : 'Слово 12');
    expect(prepareTextPipeline(rules, locale, { settings: { [id]: { lengthLastNumber: 3 } } })(`${word} 123`)).toBe(
      `${word}\u00a0123`,
    );
    expect(prepareTextPipeline(rules, locale, { settings: { [id]: { lengthLastNumber: 1 } } })(`${word} 12`)).toBe(
      `${word} 12`,
    );

    for (const value of [0, -1, 1.5, Infinity, NaN, Number.MAX_SAFE_INTEGER + 1, '2', true]) {
      expect(() => prepareTextPipeline(rules, locale, { settings: { [id]: { lengthLastNumber: value } } })).toThrow();
    }

    expect(() => prepareTextPipeline(rules, locale, { settings: { [id]: { unknown: true } } })).toThrow(
      'Invalid setting',
    );
  });

  it.each(['en', 'ru'] as const)('preserves protected content and selects the category for %s', (locale) => {
    const word = locale === 'ru' ? 'Слово' : 'Word';
    const service = new Typographist({ locale, categories: ['nonbreakingSpacing'], protectedContent: [`${word} 12`] });
    const content = '$100 100 руб. 12345 1.25 1/2 2026-10-08 +7-999-123-45-67 word word MiXeD мiкс e\u0301 😀';
    const protectedText = `https://example.com/12 user@example.com ${word} 12`;

    expect(service.format(`${content} ${protectedText} ${word} 2`)).toBe(
      `${locale === 'ru' ? content.replace('100 руб.', '100\u00a0руб.') : content} ${protectedText} ${word}\u00a02`,
    );
    expect(service.format('')).toBe('');
    expect(service.format(' \r\n\t\u00a0')).toBe(' \r\n\t\u00a0');

    for (const categories of [[], ['spacing'], ['hyphenation']] as const) {
      expect(new Typographist({ locale, categories, excludedWords: [word] }).format(`${word} 12`)).toBe(`${word} 12`);
    }
  });

  it.each([false, true])('combines ordinary spacing and hyphenation with useFast=%s', (useFast) => {
    const service = new Typographist({ useFast });
    const legacy = new Typographist({ useFast, categories: ['hyphenation'] });
    const expected = legacy.format('example\u00a012.');

    expect(service.format('example  12.')).toBe(expected);
    expect(service.format(expected)).toBe(expected);
  });
});
