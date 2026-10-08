import { Typographist } from '@/typographist/typographist.js';

describe('Unit, year-range and particle spacing interactions', () => {
  it.each(
    (['en', 'ru'] as const).flatMap((locale) =>
      [false, true].flatMap((useFast) => [0, 64].map((cacheSize) => ({ locale, useFast, cacheSize }))),
    ),
  )('combines spacing for $locale, useFast=$useFast, cacheSize=$cacheSize', (configuration) => {
    const protectedText = '300dpi 12м2 2025-2026 г.г. она же там';
    const protectedContent = [protectedText];
    const service = new Typographist({
      ...configuration,
      categories: ['spacing', 'nonbreakingSpacing', 'hyphenation'],
      protectedContent,
    });
    const legacy = new Typographist({ ...configuration, categories: ['hyphenation'], protectedContent });
    const labels = '300  dpi\n12м2\n2025-2026  г.г.\nона  же там';
    const spaced = '300 dpi\n12м2\n2025-2026 г.г.\nона же там';
    const bound =
      configuration.locale === 'ru'
        ? '300\u00a0dpi\n12\u00a0м2\n2025-2026\u00a0г.\u00a0г.\nона\u00a0же там'
        : '300\u00a0dpi\n12м2\n2025-2026 г.г.\nона же там';
    const content = '$100 12345 1.25 1/2 2026-10-08 +7-999-123-45-67 word word MiXeD мiкс 😀 е́';
    const addresses = 'https://example.com/300dpi user12m2@example.com';
    const suffix = `\n${content}\n${addresses}\n${protectedText}`;
    const input = labels + suffix;
    const expected = legacy.format(bound + suffix);

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
