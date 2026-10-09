import { Typographist } from '@/typographist/typographist.js';

describe('Russian number-sign, address and abbreviation spacing interactions', () => {
  it.each(
    (['en', 'ru'] as const).flatMap((locale) =>
      [false, true].flatMap((useFast) => [0, 64].map((cacheSize) => ({ locale, useFast, cacheSize }))),
    ),
  )('combines label spacing for $locale, useFast=$useFast, cacheSize=$cacheSize', (configuration) => {
    const protectedText = '№  12 УЛ.  Московская дом12 т.  д.';
    const protectedContent = [protectedText];
    const service = new Typographist({
      ...configuration,
      categories: ['spacing', 'nonbreakingSpacing', 'hyphenation'],
      protectedContent,
    });
    const legacy = new Typographist({ ...configuration, categories: ['hyphenation'], protectedContent });
    const labels = '№ 12345\nУЛ. Московская дом12\nт. д.';
    const spaced = '№ 12345\nУЛ. Московская дом12\nт. д.';
    const bound = '№\u202f12345\nУЛ.\u00a0Московская дом\u00a012\nт.\u00a0д.';
    const content = '$100 12345 1.25 1/2 2026-10-08 +7-999-123-45-67 word word MiXeD мiкс 😀 е́';
    const addresses = 'https://example.com/дом12 дом12@example.com';
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
