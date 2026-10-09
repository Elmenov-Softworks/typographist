import { createBundledNonbreakingSpacing } from '@/text/typography/bundled-nonbreaking-spacing.factory.js';
import { prepareTextPipeline } from '@/text/typography/prepare-text-pipeline.util.js';
import { Typographist } from '@/typographist/typographist.js';

const id = 'common/nbsp/beforeShortLastWord';
const prepare = (locale: string, lengthLastWord = 3) =>
  prepareTextPipeline(
    createBundledNonbreakingSpacing(locale).filter((rule) => rule.id === id),
    locale,
    { settings: { [id]: { lengthLastWord } } },
  );

describe('nonbreaking spacing before short sentence-final words', () => {
  it.each([
    ['en', 'Here you go.', 'Here you go.'],
    ['en', 'Take 123 CAT! Next sentence.', 'Take 123 CAT! Next sentence.'],
    ['en', 'hello cat? Next dog…', 'hello cat? Next dog…'],
    ['ru', 'Это был кот.', 'Это был кот.'],
    ['ru', 'Вижу 123 ЁЖ! Новый текст.', 'Вижу 123 ЁЖ! Новый текст.'],
    ['en', '😀 café cat. hello cat.', '😀 café cat. hello cat.'],
  ])('matches reference boundaries for %s: %j', (locale, text, expected) => {
    const format = prepare(locale);

    expect(format(text)).toBe(expected);
    expect(format(expected)).toBe(expected);
  });

  it.each([
    '',
    ' \r\n\t',
    'hello cat',
    'HELLO cat.',
    'hello cats.',
    'hello cat. next',
    'hello cat.\nNext',
    'hello cat.\r\nNext',
    'hello cat.”',
    'hello  cat.',
    'hello\tcat.',
    'hello cat.',
    'hello cаt.',
    'hello cát.',
    'hello cat. ',
    '$100 12345 1.25 1/2 2026-10-08 +7-999-123-45-67 word word MiXeD',
  ])('preserves %j', (text) => {
    expect(prepare('en')(text)).toBe(text);
  });

  it.each(['en', 'ru'] as const)('validates settings for %s', (locale) => {
    const text = locale === 'en' ? 'hello cats.' : 'вижу кота.';

    expect(prepare(locale)(text)).toBe(text);
    expect(prepare(locale, 4)(text)).toBe(text.replace(' ', ' '));
    expect(prepare(locale, 1)(text)).toBe(text);
    for (const value of [0, -1, 1.5, Infinity, NaN, Number.MAX_SAFE_INTEGER + 1, '3', true]) {
      expect(() =>
        prepareTextPipeline(createBundledNonbreakingSpacing(locale), locale, {
          settings: { [id]: { lengthLastWord: value } },
        }),
      ).toThrow();
    }
    expect(() =>
      prepareTextPipeline(createBundledNonbreakingSpacing(locale), locale, {
        settings: { [id]: { unknown: true } },
      }),
    ).toThrow('Invalid setting');
  });

  it.each(['en', 'ru'] as const)('respects categories and protected content for %s', (locale) => {
    const text = locale === 'en' ? 'hello cat.' : 'вижу кот.';
    const protectedText = `${text} https://example.com/cat. user@example.com`;
    const service = new Typographist({ locale, categories: ['nonbreakingSpacing'], protectedContent: [text] });

    expect(service.format(protectedText)).toBe(protectedText);
    for (const categories of [[], ['spacing'], ['hyphenation']] as const) {
      expect(new Typographist({ locale, categories, excludedWords: text.split(' ') }).format(text)).toBe(text);
    }
    expect(new Typographist({ locale, categories: ['nonbreakingSpacing'] }).format(text)).toBe(text.replace(' ', ' '));
  });

  it.each([false, true])('combines spacing and hyphenation with useFast=%s', (useFast) => {
    const service = new Typographist({ useFast });
    const legacy = new Typographist({ useFast, categories: ['hyphenation'] });
    const expected = legacy.format('hello cat.');

    expect(service.format('hello cat.')).toBe(expected);
    expect(service.format(expected)).toBe(expected);
  });

  it('does not supply rules to consumer locales', () => {
    expect(createBundledNonbreakingSpacing('custom')).toEqual([]);
  });
});
