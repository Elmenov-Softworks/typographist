import { createBundledNonbreakingSpacing } from '@/text/typography/bundled-nonbreaking-spacing.factory.js';
import { prepareTextPipeline } from '@/text/typography/prepare-text-pipeline.util.js';
import { Typographist } from '@/typographist/typographist.js';

const id = 'common/nbsp/afterShortWord';

const prepare = (locale: string, lengthShortWord = 2) =>
  prepareTextPipeline(
    createBundledNonbreakingSpacing(locale).filter((rule) => rule.id === id),
    locale,
    { settings: { [id]: { lengthShortWord } } },
  );

describe('nonbreaking spacing after short words', () => {
  it.each([
    ['en', 'a I to be here', 'a\u00a0I\u00a0to\u00a0be\u00a0here'],
    ['ru', 'я и ты же тут', 'я\u00a0и\u00a0ты\u00a0же\u00a0тут'],
    ['en', '(a word) «to word»', '(a\u00a0word) «to\u00a0word»'],
    ['ru', '(я тут) «ты там»', '(я\u00a0тут) «ты\u00a0там»'],
    ['en', 'x\na word\r\nb word', 'x\na\u00a0word\r\nb\u00a0word'],
    ['en', 'a\tword a  word a\u00a0word', 'a\tword a\u00a0 word a\u00a0word'],
    ['en', 'a-b word 12 word e\u0301 word 😀 a word', 'a-b word 12 word e\u0301 word 😀 a\u00a0word'],
    ['en', "'a word [a word a", "'a word [a word a"],
    ['en', 'я и ты же тут', 'я и ты же тут'],
    ['ru', 'a I to be here', 'a I to be here'],
    ['en', 'a b c d end', 'a\u00a0b\u00a0c\u00a0d\u00a0end'],
  ])('matches isolated reference behavior for %s: %j', (locale, input, expected) => {
    const format = prepare(locale);

    expect(format(input)).toBe(expected);
    expect(format(expected)).toBe(expected);
  });

  it.each(['en', 'ru'] as const)('supports limits and rejects invalid settings for %s', (locale) => {
    const input = locale === 'ru' ? 'я ты тут слово' : 'a to the word';
    const words = input.split(' ');

    expect(prepare(locale, 1)(input)).toBe(words.join(' ').replace(' ', '\u00a0'));
    expect(prepare(locale, 3)(input)).toBe(words.join('\u00a0'));

    for (const value of [0, -1, 1.5, Infinity, NaN, Number.MAX_SAFE_INTEGER + 1, '2', true]) {
      expect(() =>
        prepareTextPipeline(createBundledNonbreakingSpacing(locale), locale, {
          settings: { [id]: { lengthShortWord: value } },
        }),
      ).toThrow();
    }

    expect(() =>
      prepareTextPipeline(createBundledNonbreakingSpacing(locale), locale, {
        settings: { [id]: { unknown: true } },
      }),
    ).toThrow('Invalid setting');
  });

  it.each(['en', 'ru'] as const)('preserves composition and protected content for %s', (locale) => {
    const phrase = locale === 'ru' ? 'я тут' : 'a word';
    const service = new Typographist({ locale, categories: ['nonbreakingSpacing'], protectedContent: [phrase] });
    const content = '$100 100 руб. 12345 1.25 1/2 2026-10-08 +7-999-123-45-67 word word MiXeD мiкс e\u0301 😀';
    const input = `${content} https://example.com/a user@example.com ${phrase}`;

    expect(service.format(input)).toBe(input);
    expect(service.format('')).toBe('');
    expect(service.format(' \r\n\t\u00a0')).toBe(' \r\n\t\u00a0');
    expect(service.format(locale === 'ru' ? 'я\u00adб тут' : 'a\u00adb word')).toBe(
      locale === 'ru' ? 'я\u00adб тут' : 'a\u00adb word',
    );

    for (const categories of [[], ['spacing'], ['hyphenation']] as const) {
      const disabled = new Typographist({ locale, categories, excludedWords: phrase.split(' ') });

      expect(disabled.format(phrase)).toBe(phrase);
    }
  });

  it.each([false, true])('combines ordinary spacing and hyphenation with useFast=%s', (useFast) => {
    const service = new Typographist({ useFast });
    const legacy = new Typographist({ useFast, categories: ['hyphenation'] });
    const expected = legacy.format('a\u00a0table');

    expect(service.format('a  table')).toBe(expected);
    expect(service.format(expected)).toBe(expected);
  });

  it('does not supply implicit rules to consumer locales', () => {
    expect(createBundledNonbreakingSpacing('custom')).toEqual([]);
  });
});
