import { Typographist } from '@/typographist/typographist.js';

describe('Russian single-year and see abbreviation spacing interactions', () => {
  it.each(
    (['en', 'ru'] as const).flatMap((locale) =>
      [false, true].flatMap((useFast) => [0, 64].map((cacheSize) => ({ locale, useFast, cacheSize }))),
    ),
  )('combines label spacing for $locale, useFast=$useFast, cacheSize=$cacheSize', (configuration) => {
    const protectedText = '2026  г. см.  текст им.  Пушкина';
    const protectedContent = [protectedText];
    const service = new Typographist({
      ...configuration,
      categories: ['spacing', 'nonbreakingSpacing', 'hyphenation'],
      protectedContent,
    });
    const legacy = new Typographist({ ...configuration, categories: ['hyphenation'], protectedContent });
    const labels = '2026  г.\nсм.  текст\nИМ.  Пушкина\nсм.  001!';
    const spaced = '2026 г.\nсм. текст\nИМ. Пушкина\nсм. 001!';
    const bound = '2026\u00a0г.\nсм.\u00a0текст\nИМ. Пушкина\nсм.\u00a0001!';
    const content = '$100 12345 1.25 1/2 2026-10-08 +7-999-123-45-67 word word MiXeD мiкс 😀 е́';
    const addresses = 'https://example.com/2026г names@example.com';
    const suffix = `\n${content}\n${addresses}\n${protectedText}`;
    const input = labels + suffix;
    const expected = legacy.format((configuration.locale === 'ru' ? bound : spaced) + suffix);

    expect(service.format(input)).toBe(expected);
    expect(service.format(expected)).toBe(expected);
    expect(expected.replaceAll('\u00ad', '').replace(/\s/g, '')).toBe(input.replace(/\s/g, ''));
    expect(new Typographist({ ...configuration, categories: [], protectedContent }).format(input)).toBe(input);
    expect(
      new Typographist({
        ...configuration,
        categories: ['spacing', 'hyphenation'],
        protectedContent,
      }).format(input),
    ).toBe(legacy.format(spaced + suffix));
  });
});
