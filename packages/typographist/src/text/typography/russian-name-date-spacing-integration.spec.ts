import { Typographist } from '@/typographist/typographist.js';

describe('Russian name and date spacing interactions', () => {
  it.each(
    (['en', 'ru'] as const).flatMap((locale) =>
      [false, true].flatMap((useFast) => [0, 64].map((cacheSize) => ({ locale, useFast, cacheSize }))),
    ),
  )('combines name and date spacing for $locale, useFast=$useFast, cacheSize=$cacheSize', (configuration) => {
    const protectedText = 'А.  С.  Пушкин 12  января XV  в.';
    const protectedContent = [protectedText];
    const service = new Typographist({
      ...configuration,
      categories: ['spacing', 'nonbreakingSpacing', 'hyphenation'],
      protectedContent,
    });
    const legacy = new Typographist({ ...configuration, categories: ['hyphenation'], protectedContent });
    const labels = 'А. С. Пушкин\n12 января\nXV в.\nXV-XVI в. в.';
    const spaced = 'А. С. Пушкин\n12 января\nXV в.\nXV-XVI в. в.';
    const bound = 'А.\u00a0С.\u00a0Пушкин\n12\u00a0января\nXV\u00a0в.\nXV-XVI\u00a0в.\u00a0в.';
    const content = '$100 12345 1.25 1/2 2026-10-08 +7-999-123-45-67 word word MiXeD мiкс 😀 е́';
    const addresses = 'https://example.com/А.С.Пушкин names@example.com';
    const suffix = `\n${content}\n${addresses}\n${protectedText}`;
    const input = labels + suffix;
    const normalized = (configuration.locale === 'ru' ? bound : spaced.replace('XV в.', 'XV\u00a0в.')) + suffix;
    const expected = legacy.format(normalized);

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
