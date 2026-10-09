import { Typographist } from '@/index.js';

describe.each(['en', 'ru'] as const)('short-word boundary spacing for %s', (locale) => {
  const service = new Typographist({
    locale,
    rules: [],
    textLocales: [{ locale, textRules: [] }],
    categories: ['nonbreakingSpacing'],
  });

  it('requires a following same-line target', () => {
    const words = locale === 'en' ? ['a', 'the', 'I'] : ['я', 'и', 'если', 'ООО', 'мкр.', 'мк-н', 'литер'];

    for (const word of words) {
      for (const suffix of [
        ' ',
        '   ',
        ' \r',
        ' \n',
        '  \r\n',
        ' \t',
        '  \t\n',
        ' \tcat',
        '  \r\ncat',
        '\u00a0',
        '\u202f',
      ]) {
        const input = word + suffix;

        expect(service.format(input), input).toBe(input);
      }
    }
  });

  it('binds same-line content while retaining extra ordinary spaces', () => {
    const fixtures: [string, string][] =
      locale === 'en'
        ? [
            ['a   cat', 'a\u00a0  cat'],
            ['the  cat', 'the\u00a0 cat'],
          ]
        : [
            ['я   тут', 'я\u00a0  тут'],
            ['если  тут', 'если\u00a0 тут'],
            ['ООО   Дом', 'ООО\u00a0  Дом'],
            ['мкр.   Центр', 'мкр.\u00a0  Центр'],
            ['литер   А', 'литер\u00a0  А'],
          ];

    for (const [input, expected] of fixtures) {
      expect(service.format(input)).toBe(expected);
      expect(service.format(expected)).toBe(expected);
    }
  });
});
