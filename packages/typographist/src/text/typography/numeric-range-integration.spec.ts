import { Typographist } from '@/typographist/typographist.js';

describe('Numeric-range dash interactions', () => {
  it.each(
    (['en', 'ru'] as const).flatMap((locale) =>
      [false, true].flatMap((useFast) => [0, 64].map((cacheSize) => ({ locale, useFast, cacheSize }))),
    ),
  )('combines ranges for $locale, useFast=$useFast, cacheSize=$cacheSize', (configuration) => {
    const protectedRange = '1990-2000 гг. 8:00-17:30 40-50-е годы 4-6 мая';
    const protectedContent = [protectedRange];
    const service = new Typographist({
      ...configuration,
      categories: ['spacing', 'dashes', 'hyphenation'],
      protectedContent,
    });
    const legacy = new Typographist({ ...configuration, categories: ['hyphenation'], protectedContent });
    const ranges = '2020-2021 гг. 9:00-18:30 20-30-е годы 1-3 января';
    const normalizedRanges = '2020–2021 гг. 9:00–18:30 20–30-е годы 1–3\u00a0января';
    const content = '$100 100 руб. 12345 1.25 1/2 2026-10-08 +7-999-123-45-67 word word MiXeD мiкс 😀 е́';
    const addresses = 'https://example.com/2020-2021 user-name@example.com id2020-2021г';
    const input = `Typography ${ranges}\n${content}\n${addresses}\n${protectedRange}`;
    const normalized = `Typography ${configuration.locale === 'ru' ? normalizedRanges : ranges}\n${content}\n${addresses}\n${protectedRange}`;
    const expected = legacy.format(normalized);

    expect(service.format(input)).toBe(expected);
    expect(service.format(expected)).toBe(expected);
    expect(new Typographist({ ...configuration, categories: [], protectedContent }).format(input)).toBe(input);
    expect(legacy.format(input).replaceAll('\u00ad', '')).toBe(input);

    const spacingOnly = new Typographist({
      ...configuration,
      categories: ['spacing', 'hyphenation'],
      protectedContent,
    });

    expect(spacingOnly.format(input)).toBe(legacy.format(input.replace('Typography  ', 'Typography ')));
  });
});
