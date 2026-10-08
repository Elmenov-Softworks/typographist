import { createBundledNonbreakingSpacing } from '@/text/typography/bundled-nonbreaking-spacing.factory.js';
import { prepareTextPipeline } from '@/text/typography/prepare-text-pipeline.util.js';
import { Typographist } from '@/typographist/typographist.js';

const id = 'ru/nbsp/see';
const rules = createBundledNonbreakingSpacing('ru').filter((rule) => rule.id === id);
const format = prepareTextPipeline(rules, 'ru');

describe('Russian see/name abbreviation spacing', () => {
  it.each([
    ['см. текст', 'см. текст'],
    ['ИМ.Пушкина', 'ИМ. Пушкина'],
    ['(см. 001)', '(см. 001)'],
    ['(см. 001!', '(см. 001!'],
    ['см. abc, им. Ёлки?', 'см. abc, им. Ёлки?'],
    ['слово см. текст', 'слово см. текст'],
    ['см. текст', 'см. текст'],
    ['😀 см. текст\r\nе́ им. Имя\n', '😀 см. текст\r\nе́ им. Имя\n'],
  ])('changes only whitespace in %j', (text, expected) => {
    expect(format(text)).toBe(expected);
    expect(format(expected)).toBe(expected);
    expect(expected.replace(/\s/g, '')).toBe(text.replace(/\s/g, ''));
  });

  it.each([
    '',
    ' \r\n\t',
    'см.',
    'см текст',
    'см.  текст',
    'см.\tтекст',
    'см.\nтекст',
    'асм. текст',
    'см. текст)',
    'см. текст;',
    'см. текст:',
    'см. 1/2',
    'см. 1-2',
    'см. 2026-10-08',
    'см. é',
    'см. café',
    '$100 100 руб. 12345 1.25 1/2 2026-10-08 +7-999-123-45-67 слово слово MiXeD',
  ])('preserves negative boundary %j', (text) => {
    expect(format(text)).toBe(text);
  });

  it('preserves reference matching for adjacent abbreviations', () => {
    const first = format('см. a см. b см. c');

    expect(first).toBe('см. a см. b см. c');
    expect(format(first)).toBe(first);
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
      expect(new Typographist({ locale: 'ru', categories }).format('см. 12')).toBe('см. 12');
    }
    const service = new Typographist({
      locale: 'ru',
      categories: ['nonbreakingSpacing'],
      protectedContent: ['см. 12'],
    });

    expect(service.format('см. 12 им. 34, https://example.com/см.12 name@example.com')).toBe(
      'см. 12 им. 34, https://example.com/см.12 name@example.com',
    );
  });

  it.each([false, true])('combines ordinary spacing and hyphenation with useFast=%s', (useFast) => {
    const service = new Typographist({ locale: 'ru', useFast });
    const legacy = new Typographist({ locale: 'ru', useFast, categories: ['hyphenation'] });
    const expected = legacy.format('Типографика см. 12345');

    expect(service.format('Типографика см.  12345')).toBe(expected);
    expect(service.format(expected)).toBe(expected);
  });
});
