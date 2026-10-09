import { createBundledNonbreakingSpacing } from '@/text/typography/bundled-nonbreaking-spacing.factory.js';
import { prepareTextPipeline } from '@/text/typography/prepare-text-pipeline.util.js';
import { Typographist } from '@/typographist/typographist.js';

const id = 'ru/nbsp/mln';
const rules = createBundledNonbreakingSpacing('ru').filter((rule) => rule.id === id);
const format = prepareTextPipeline(rules, 'ru');

describe('Russian large-number-label spacing', () => {
  it.each([
    ['1 тыс.', '1 тыс.'],
    ['25млн', '25 млн'],
    ['12345 млрд рублей', '12345 млрд рублей'],
    ['7 ТРЛН.', '7 ТРЛН.'],
    ['1.25млн.', '1.25 млн.'],
    ['1/2 тыс.', '1/2 тыс.'],
    ['1тыс. 2млн. 3млрд. 4трлн.', '1 тыс. 2 млн. 3 млрд. 4 трлн.'],
    ['😀 1млн\r\nе́ 2тыс\n', '😀 1 млн\r\nе́ 2 тыс\n'],
    ['1млн\tрублей', '1 млн\tрублей'],
  ])('changes only whitespace in %j', (text, expected) => {
    expect(format(text)).toBe(expected);
    expect(format(expected)).toBe(expected);
    expect(expected.replace(/\s/g, '')).toBe(text.replace(/\s/g, ''));
  });

  it.each(['', ' \r\n\t', 'млн', '1  млн', '1\tмлн', '1\nмлн', '1 млн', '1млн,', '1млн!', '1миллион', '1млнa'])(
    'preserves negative boundary %j',
    (text) => {
      expect(format(text)).toBe(text);
    },
  );

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
      expect(new Typographist({ locale: 'ru', categories }).format('1 млн.')).toBe('1 млн.');
    }
    const service = new Typographist({
      locale: 'ru',
      categories: ['nonbreakingSpacing'],
      protectedContent: ['1 млн.'],
    });

    expect(service.format('1 млн. 2 млрд., https://example.com/1млн. 1mln@example.com')).toBe(
      '1 млн. 2 млрд., https://example.com/1млн. 1mln@example.com',
    );
  });

  it.each([false, true])('combines ordinary spacing and hyphenation with useFast=%s', (useFast) => {
    const service = new Typographist({ locale: 'ru', useFast });
    const legacy = new Typographist({ locale: 'ru', useFast, categories: ['hyphenation'] });
    const expected = legacy.format('Типографика 1 млн.');

    expect(service.format('Типографика 1 млн.')).toBe(expected);
    expect(service.format(expected)).toBe(expected);
  });
});
