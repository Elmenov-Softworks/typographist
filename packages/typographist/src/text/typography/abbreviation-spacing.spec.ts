import { createBundledNonbreakingSpacing } from '@/text/typography/bundled-nonbreaking-spacing.factory.js';
import { prepareTextPipeline } from '@/text/typography/prepare-text-pipeline.util.js';
import { Typographist } from '@/typographist/typographist.js';

const id = 'ru/nbsp/abbr';
const rules = createBundledNonbreakingSpacing('ru').filter((rule) => rule.id === id);
const format = prepareTextPipeline(rules, 'ru');

describe('Russian abbreviation spacing', () => {
  it.each([
    ['т.д.', 'т. д.'],
    ['и т. п.', 'и т. п.'],
    ['а.е.м.', 'а. е. м.'],
    ['т.д. т.п.', 'т. д. т. п.'],
    ['\r\nт.д.\tт.п.', '\r\nт. д.\tт. п.'],
    ['😀 ё.ж. е́ т.д.', '😀 ё. ж. е́ т. д.'],
    [
      'т.д. $100 100 руб. 12345 1.25 1/2 2026-10-08 +7-999-123-45-67 MiXeD слово слово',
      'т. д. $100 100 руб. 12345 1.25 1/2 2026-10-08 +7-999-123-45-67 MiXeD слово слово',
    ],
  ])('changes only abbreviation whitespace in %j', (text, expected) => {
    expect(format(text)).toBe(expected);
    expect(format(expected)).toBe(expected);
    expect(expected.replace(/\s/g, '')).toBe(text.replace(/\s/g, ''));
  });

  it.each([
    '',
    ' \r\n\t',
    'Т.Д.',
    'т.Д.',
    'Т.д.',
    'т.  д.',
    'т.\tд.',
    'т.\nд.',
    'т. д.',
    '(т.д.)',
    'abcd т.d.',
    'абвг.д.',
    'дд.мм.гггг',
    'а.рф.',
    'а.ру.',
    'а.рус.',
    'а.орг.',
    'а.укр.',
    'а.бг.',
    'а.срб.',
  ])('preserves reference negative boundary %j', (text) => {
    expect(format(text)).toBe(text);
  });

  it('rejects unknown settings and supplies no implicit consumer or English rule', () => {
    expect(() => prepareTextPipeline(rules, 'ru', { settings: { [id]: { unknown: true } } })).toThrow(
      'Invalid setting',
    );
    for (const locale of ['en', 'custom']) {
      expect(createBundledNonbreakingSpacing(locale).some((rule) => rule.id === id)).toBe(false);
    }
  });

  it('respects categories and protected content', () => {
    for (const categories of [[], ['spacing'], ['hyphenation']] as const) {
      expect(new Typographist({ locale: 'ru', categories }).format('т.д.')).toBe('т.д.');
    }
    const service = new Typographist({
      locale: 'ru',
      categories: ['nonbreakingSpacing'],
      protectedContent: ['т.д.'],
    });

    expect(service.format('т.д. т.п. https://example.com/т.д. т.д.@example.com')).toBe(
      'т.д. т. п. https://example.com/т.д. т.д.@example.com',
    );
  });

  it.each([false, true])('combines spacing and hyphenation with useFast=%s', (useFast) => {
    const service = new Typographist({ locale: 'ru', useFast });
    const legacy = new Typographist({ locale: 'ru', useFast, categories: ['hyphenation'] });
    const expected = legacy.format('Типографика т. д.');

    expect(service.format('Типографика т.  д.')).toBe(expected);
    expect(service.format(expected)).toBe(expected);
  });
});
