import { Typographist } from '@/typographist/typographist.js';

describe('Locale spacing and final newline interactions', () => {
  it.each(
    (['en', 'ru'] as const).flatMap((locale) =>
      [false, true].flatMap((useFast) => [0, 64].map((cacheSize) => ({ locale, useFast, cacheSize }))),
    ),
  )('combines spacing for $locale, useFast=$useFast, cacheSize=$cacheSize', (configuration) => {
    const settings = { 'common/space/insertFinalNewline': { enabled: true } };
    const protectedContent = ['Keep\t2026год...Далее\n  literal'];
    const service = new Typographist({
      ...configuration,
      categories: ['spacing', 'punctuation', 'hyphenation'],
      settings,
      protectedContent,
    });
    const legacy = new Typographist({ ...configuration, categories: ['hyphenation'], protectedContent });
    const content = '$100 100 руб. 12345 1.25 1/2 2026-10-08 +7-999-123-45-67 word word MiXeD мiкс 😀 е́';
    const addresses = 'https://example.com/2028год...Далее user2029год@example.com';
    const input = `\t2027год...Далее\n  Typography\n\t${content}\n${addresses}\nKeep\t2026год...Далее\n  literal\n  `;
    const start = configuration.locale === 'ru' ? '2027 год… Далее' : '2027год…Далее';
    const normalized = `${start}\nTypography\n${content}\n${addresses}\nKeep\t2026год...Далее\n  literal\n`;
    const expected = legacy.format(normalized);

    expect(service.format(input)).toBe(expected);
    expect(service.format(expected)).toBe(expected);
    expect(new Typographist({ ...configuration, categories: [], settings, protectedContent }).format(input)).toBe(
      input,
    );
    expect(legacy.format(input).replaceAll('\u00ad', '')).toBe(input);
    expect(
      new Typographist({
        ...configuration,
        categories: ['spacing', 'punctuation', 'hyphenation'],
        protectedContent,
      }).format(input),
    ).toBe(legacy.format(normalized.slice(0, -1)));
  });
});
