import { createBundledNonbreakingSpacing } from '@/text/typography/bundled-nonbreaking-spacing.factory.js';
import { prepareTextPipeline } from '@/text/typography/prepare-text-pipeline.util.js';
import { Typographist } from '@/typographist/typographist.js';

const id = 'ru/nbsp/ooo';
const rules = createBundledNonbreakingSpacing('ru').filter((rule) => rule.id === id);
const format = prepareTextPipeline(rules, 'ru');

describe('Russian organization-abbreviation spacing', () => {
  it.each([
    ['ООО Ромашка', 'ООО Ромашка'],
    ['ОАО Завод', 'ОАО Завод'],
    ['ЗАО Компания', 'ЗАО Компания'],
    ['НИИ Науки', 'НИИ Науки'],
    ['ПБОЮЛ Иванов', 'ПБОЮЛ Иванов'],
    ['(ООО Название)', '(ООО Название)'],
    ['1ООО 12345', '1ООО 12345'],
    ['ООО  Компания', 'ООО  Компания'],
    ['ООО ', 'ООО '],
    ['😀 ООО Название\r\nе́ НИИ Науки\n', '😀 ООО Название\r\nе́ НИИ Науки\n'],
  ])('changes only whitespace in %j', (text, expected) => {
    expect(format(text)).toBe(expected);
    expect(format(expected)).toBe(expected);
    expect(expected.replace(/\s/g, '')).toBe(text.replace(/\s/g, ''));
  });

  it.each([
    '',
    ' \r\n\t',
    'ООО',
    'ооо Название',
    'Ооо Название',
    'ООО\tНазвание',
    'ООО\nНазвание',
    'ООО Название',
    'ООО, Название',
    'аООО Название',
    'ЁООО Название',
    'AООО Название',
    'zООО Название',
    'éООО Название',
  ])('preserves negative boundary %j', (text) => {
    expect(format(text)).toBe(text);
  });

  it('preserves reference matching for adjacent abbreviations', () => {
    const first = format('ООО ОАО ЗАО НИИ ПБОЮЛ Название');

    expect(first).toBe('ООО ОАО ЗАО НИИ ПБОЮЛ Название');
    expect(format(first)).toBe(first);
  });

  it('preserves numeric and lexical representations', () => {
    const text = '$100 100 руб. 12345 1.25 1/2 2026-10-08 +7-999-123-45-67 слово слово MiXeD';

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

  it('respects categories and protected content', () => {
    for (const categories of [[], ['spacing'], ['hyphenation']] as const) {
      expect(new Typographist({ locale: 'ru', categories }).format('ООО Мир')).toBe('ООО Мир');
    }
    const service = new Typographist({
      locale: 'ru',
      categories: ['nonbreakingSpacing'],
      protectedContent: ['ООО Ромашка'],
    });

    expect(service.format('ООО Ромашка НИИ Науки, https://example.com/ООО name@example.com')).toBe(
      'ООО Ромашка НИИ Науки, https://example.com/ООО name@example.com',
    );
  });

  it.each([false, true])('combines ordinary spacing and hyphenation with useFast=%s', (useFast) => {
    const service = new Typographist({ locale: 'ru', useFast });
    const legacy = new Typographist({ locale: 'ru', useFast, categories: ['hyphenation'] });
    const expected = legacy.format('Типографика ООО Ромашка');

    expect(service.format('Типографика ООО Ромашка')).toBe(expected);
    expect(service.format(expected)).toBe(expected);
  });
});
