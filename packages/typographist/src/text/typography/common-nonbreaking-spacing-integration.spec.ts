import { Typographist } from '@/typographist/typographist.js';

describe('Common nonbreaking spacing interactions', () => {
  it.each(
    (['en', 'ru'] as const).flatMap((locale) =>
      [false, true].flatMap((useFast) => [0, 64].map((cacheSize) => ({ locale, useFast, cacheSize }))),
    ),
  )('combines spacing for $locale, useFast=$useFast, cacheSize=$cacheSize', (configuration) => {
    const protectedText = 'Keep\u00a0 §1 ¶2 300dpi 100 examples';
    const protectedContent = [protectedText];
    const service = new Typographist({
      ...configuration,
      categories: ['spacing', 'nonbreakingSpacing', 'hyphenation'],
      protectedContent,
    });
    const legacy = new Typographist({ ...configuration, categories: ['hyphenation'], protectedContent });
    const word = configuration.locale === 'ru' ? 'примеров' : 'examples';
    const sectionSpace = configuration.locale === 'ru' ? '\u202f' : '\u00a0';
    const content = '$100 12345 1.25 1/2 2026-10-08 +7-999-123-45-67 word word MiXeD мiкс 😀 е́';
    const addresses = 'https://example.com/300dpi user300dpi@example.com';
    const input = `Typography\u00a0 formatting\n§ 1 ¶\t2\n300dpi\n100 ${word}\n${content}\n${addresses}\n${protectedText}`;
    const normalized = `Typography\u00a0 formatting\n§${sectionSpace}1 ¶\t2\n300\u00a0dpi\n100\u00a0${word}\n${content}\n${addresses}\n${protectedText}`;
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
    ).toBe(
      legacy.format(
        `Typography\u00a0 formatting\n§ 1 ¶\t2\n300dpi\n100 ${word}\n${content}\n${addresses}\n${protectedText}`,
      ),
    );
  });
});
