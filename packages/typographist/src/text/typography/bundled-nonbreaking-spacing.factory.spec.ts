import { createBundledNonbreakingSpacing } from '@/text/typography/bundled-nonbreaking-spacing.factory.js';
import { prepareTextPipeline } from '@/text/typography/prepare-text-pipeline.util.js';
import { Typographist } from '@/typographist/typographist.js';

describe('Russian initials spacing', () => {
  const id = 'ru/nbsp/initials';
  const rules = createBundledNonbreakingSpacing('ru').filter((rule) => rule.id === id);
  const format = prepareTextPipeline(rules, 'ru');

  it.each([
    ['А.С.Пушкин', 'А.\u00a0С.\u00a0Пушкин'],
    ['А. С. Пушкин', 'А.\u00a0С.\u00a0Пушкин'],
    ['Ё.\u202fИ.\u00a0Ёлкин', 'Ё.\u00a0И.\u00a0Ёлкин'],
    ['(А.С.Пушкин), «М.Ю.Лермонтов»', '(А.\u00a0С.\u00a0Пушкин), «М.\u00a0Ю.\u00a0Лермонтов»'],
    [
      '„А.С.Пушкин“ ‚М.Ю.Лермонтов‘ "Л.Н.Толстой"',
      '„А.\u00a0С.\u00a0Пушкин“ ‚М.\u00a0Ю.\u00a0Лермонтов‘ "Л.\u00a0Н.\u00a0Толстой"',
    ],
    [
      'А.С.Пушкин\r\nМ.Ю.Лермонтов\nЛ.Н.Толстой',
      'А.\u00a0С.\u00a0Пушкин\r\nМ.\u00a0Ю.\u00a0Лермонтов\nЛ.\u00a0Н.\u00a0Толстой',
    ],
    ['😀 А.С.Пу́шкин 12345 1.25 1/2', '😀 А.\u00a0С.\u00a0Пу́шкин 12345 1.25 1/2'],
  ])('matches isolated reference behavior for %j', (text, expected) => {
    expect(rules).toHaveLength(1);
    expect(format(text)).toBe(expected);
    expect(format(expected)).toBe(expected);
  });

  it.each([
    '',
    ' \r\n\t',
    'А. Пушкин',
    'а.С.Пушкин',
    'А.с.Пушкин',
    'А.С.пушкин',
    'A.S.Pushkin',
    'А.С.ПУШКИН',
    'А.С.П',
    'А.  С. Пушкин',
    'А.\tС.Пушкин',
    'А.С.\nПушкин',
    '[А.С.Пушкин]',
    'xА.С.Пушкин',
    'А\u00ad.С.Пушкин',
    'А́.С.Пушкин',
  ])('preserves unsupported boundaries in %j', (text) => {
    expect(format(text)).toBe(text);
  });

  it('rejects settings and supplies initials only for Russian', () => {
    expect(() => prepareTextPipeline(rules, 'ru', { settings: { [id]: { unknown: true } } })).toThrow(
      'Invalid setting',
    );
    expect(createBundledNonbreakingSpacing('en').some((rule) => rule.id === id)).toBe(false);
    expect(createBundledNonbreakingSpacing('custom')).toEqual([]);
  });

  it('preserves lexical and numeric content', () => {
    const content = '$100 100 руб. 12345 1.25 1/2 2026-10-08 +7-999-123-45-67 word word MiXeD мiкс e\u0301 😀';

    expect(format(`${content} А.С.Пушкин`)).toBe(`${content} А.\u00a0С.\u00a0Пушкин`);
  });

  it('respects categories, protected content and hyphenation exclusions', () => {
    const text = 'А.С.Пушкин';
    const service = new Typographist({ locale: 'ru', categories: ['nonbreakingSpacing'], excludedWords: [text] });
    const protectedService = new Typographist({
      locale: 'ru',
      categories: ['nonbreakingSpacing'],
      protectedContent: [text],
    });
    const addresses = 'https://example.com/А.С.Пушкин А.С.Пушкин@example.com';

    expect(service.format(text)).toBe('А.\u00a0С.\u00a0Пушкин');
    expect(protectedService.format(`${text} ${addresses}`)).toBe(`${text} ${addresses}`);
    for (const categories of [[], ['spacing'], ['hyphenation']] as const) {
      expect(new Typographist({ locale: 'ru', categories, excludedWords: ['Пушкин'] }).format('А. С. Пушкин')).toBe(
        'А. С. Пушкин',
      );
    }
  });

  it.each([false, true])('combines ordinary spacing and hyphenation with useFast=%s', (useFast) => {
    const service = new Typographist({ locale: 'ru', useFast });
    const legacy = new Typographist({ locale: 'ru', useFast, categories: ['hyphenation'] });
    const expected = legacy.format('А.\u00a0С.\u00a0Пушкин');

    expect(service.format('А.  С.  Пушкин')).toBe(expected);
    expect(service.format(expected)).toBe(expected);
  });
});

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

describe('Russian day–month spacing', () => {
  const id = 'ru/nbsp/dayMonth';
  const rules = createBundledNonbreakingSpacing('ru').filter((rule) => rule.id === id);
  const format = prepareTextPipeline(rules, 'ru');

  it.each([
    'января',
    'февраля',
    'марта',
    'апреля',
    'мая',
    'май',
    'мае',
    'июня',
    'июля',
    'августа',
    'сентября',
    'октября',
    'ноября',
    'декабря',
    'ЯНВ.',
    'МаЯ',
  ])('binds a number to the month prefix in %j', (month) => {
    const text = `1 ${month}, 31 ${month}`;
    const expected = `1\u00a0${month}, 31\u00a0${month}`;

    expect(format(text)).toBe(expected);
    expect(format(expected)).toBe(expected);
  });

  it.each([
    '',
    ' \r\n\t',
    '1января',
    '1  января',
    '1\tянваря',
    '1\nянваря',
    '1\rянваря',
    '1\u00a0января',
    '1\u202fянваря',
    '1 January',
  ])('preserves unsupported input %j', (text) => {
    expect(format(text)).toBe(text);
  });

  it('preserves reference substring boundaries and composition', () => {
    expect(format('1 мая́к')).toBe('1\u00a0мая́к');
    expect(format('😀 12345 мартовский 1.25 мая 1/2 июня 2026-10-08 $100 100 руб. MiXeD мiкс слово слово')).toBe(
      '😀 12345\u00a0мартовский 1.25\u00a0мая 1/2\u00a0июня 2026-10-08 $100 100 руб. MiXeD мiкс слово слово',
    );
    expect(rules).toHaveLength(1);
    expect(() => prepareTextPipeline(rules, 'ru', { settings: { [id]: { unknown: true } } })).toThrow(
      'Invalid setting',
    );
    expect(createBundledNonbreakingSpacing('en').some((rule) => rule.id === id)).toBe(false);
    expect(createBundledNonbreakingSpacing('custom')).toEqual([]);
  });

  it('respects categories and protected content', () => {
    const text = '12 января';
    const service = new Typographist({ locale: 'ru', categories: ['nonbreakingSpacing'], protectedContent: [text] });

    expect(service.format(`${text} https://example.com/12января user12января@example.com`)).toBe(
      `${text} https://example.com/12января user12января@example.com`,
    );
    for (const categories of [[], ['spacing'], ['hyphenation']] as const) {
      expect(new Typographist({ locale: 'ru', categories }).format('12 мая')).toBe('12 мая');
    }
    expect(new Typographist({ locale: 'ru', categories: ['nonbreakingSpacing'] }).format(text)).toBe('12\u00a0января');
  });

  it.each([false, true])('combines ordinary spacing and hyphenation with useFast=%s', (useFast) => {
    const service = new Typographist({ locale: 'ru', useFast });
    const legacy = new Typographist({ locale: 'ru', useFast, categories: ['hyphenation'] });
    const expected = legacy.format('12\u00a0января');

    expect(service.format('12  января')).toBe(expected);
    expect(service.format(expected)).toBe(expected);
  });
});

describe('Russian single-year label spacing', () => {
  const id = 'ru/nbsp/year';
  const rules = createBundledNonbreakingSpacing('ru').filter((rule) => rule.id === id);
  const format = prepareTextPipeline(rules, 'ru');

  it.each([
    ['2026 г.', '2026\u00a0г.'],
    ['2026г', '2026\u00a0г'],
    ['(0001 г), 1999 г; 2000 г,', '(0001 г), 1999\u00a0г; 2000\u00a0г,'],
    ['😀2026 г\nе́2027 г ', '😀2026\u00a0г\nе́2027\u00a0г '],
    ['1.2026 г. 1/2027 г.', '1.2026\u00a0г. 1/2027\u00a0г.'],
    ['2026-2027 г.', '2026-2027\u00a0г.'],
  ])('matches reference boundaries and preserves composition in %j', (text, expected) => {
    expect(rules).toHaveLength(1);
    expect(format(text)).toBe(expected);
    expect(format(expected)).toBe(expected);
    expect(expected.replace(/\s/g, '')).toBe(text.replace(/\s/g, ''));
  });

  it.each([
    '',
    ' \r\n\t',
    '123 г.',
    '12345 г.',
    '2026 Г.',
    '2026 год',
    '2026 г!',
    '2026 г?',
    '2026 г:',
    '2026 г)',
    '2026 г\r\n',
    '2026 г\t',
    '2026  г.',
    '2026\tг.',
    '2026\nг.',
    '2026\u00a0г.',
    '2026\u202fг.',
    '$100 100 руб. 12345 1.25 1/2 2026-10-08 +7-999-123-45-67 слово слово MiXeD мiкс',
  ])('preserves unsupported input %j', (text) => {
    expect(format(text)).toBe(text);
  });

  it('rejects settings and supplies no implicit rule to other locales', () => {
    expect(() => prepareTextPipeline(rules, 'ru', { settings: { [id]: { unknown: true } } })).toThrow(
      'Invalid setting',
    );
    for (const locale of ['en', 'custom']) {
      expect(createBundledNonbreakingSpacing(locale).some((rule) => rule.id === id)).toBe(false);
    }
  });

  it('respects categories, exclusions and protected content', () => {
    for (const categories of [[], ['spacing'], ['hyphenation']] as const) {
      expect(new Typographist({ locale: 'ru', categories }).format('2026 г.')).toBe('2026 г.');
    }
    const service = new Typographist({
      locale: 'ru',
      categories: ['nonbreakingSpacing'],
      protectedContent: ['2026 г.'],
      excludedWords: ['2027'],
    });

    expect(service.format('2026 г. 2027 г. https://example.com/2028г. user2029г@example.com')).toBe(
      '2026 г. 2027\u00a0г. https://example.com/2028г. user2029г@example.com',
    );
  });

  it.each([false, true])('combines spacing and hyphenation with useFast=%s', (useFast) => {
    const service = new Typographist({ locale: 'ru', useFast });
    const legacy = new Typographist({ locale: 'ru', useFast, categories: ['hyphenation'] });
    const expected = legacy.format('Типографика 2026\u00a0г.');

    expect(service.format('Типографика 2026  г.')).toBe(expected);
    expect(service.format(expected)).toBe(expected);
  });
});
