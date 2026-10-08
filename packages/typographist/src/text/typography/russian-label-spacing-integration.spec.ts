import { Typographist } from '@/typographist/typographist.js';

describe('Russian label spacing interactions', () => {
  it.each(
    (['en', 'ru'] as const).flatMap((locale) =>
      [false, true].flatMap((useFast) => [0, 64].map((cacheSize) => ({ locale, useFast, cacheSize }))),
    ),
  )('combines label spacing for $locale, useFast=$useFast, cacheSize=$cacheSize', (configuration) => {
    const protectedText = 'ООО  Компания P.S. text стр. 12345 100руб. 2млн.';
    const protectedContent = [protectedText];
    const service = new Typographist({
      ...configuration,
      categories: ['spacing', 'nonbreakingSpacing', 'hyphenation'],
      protectedContent,
    });
    const legacy = new Typographist({ ...configuration, categories: ['hyphenation'], protectedContent });
    const labels = '100  руб. 25коп.\nP.  S.: Типографика\nстр.  12345\nООО  Компания\n2  МЛН.';
    const spaced = '100 руб. 25коп.\nP. S.: Типографика\nстр. 12345\nООО Компания\n2 МЛН.';
    const bound =
      '100\u00a0руб. 25\u00a0коп.\nP.\u00a0S.: Типографика\nстр.\u00a012345\nООО\u00a0Компания\n2\u00a0МЛН.';
    const content = '$100 12345 1.25 1/2 2026-10-08 +7-999-123-45-67 word word MiXeD мiкс 😀 е́';
    const addresses = 'https://example.com/100руб. labels@example.com';
    const suffix = `\n${content}\n${addresses}\n${protectedText}`;
    const input = labels + suffix;
    const normalized = (configuration.locale === 'ru' ? bound : spaced) + suffix;
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
