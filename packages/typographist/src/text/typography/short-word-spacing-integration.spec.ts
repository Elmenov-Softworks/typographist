import { Typographist } from '@/typographist/typographist.js';

describe('Short-word nonbreaking spacing interactions', () => {
  it.each(
    (['en', 'ru'] as const).flatMap((locale) =>
      [false, true].flatMap((useFast) => [0, 64].map((cacheSize) => ({ locale, useFast, cacheSize }))),
    ),
  )('combines spacing for $locale, useFast=$useFast, cacheSize=$cacheSize', (configuration) => {
    const protectedText = 'the  example a word hello cat. example 12';
    const protectedContent = [protectedText];
    const service = new Typographist({
      ...configuration,
      categories: ['spacing', 'nonbreakingSpacing', 'hyphenation'],
      protectedContent,
    });
    const legacy = new Typographist({ ...configuration, categories: ['hyphenation'], protectedContent });
    const phrases =
      configuration.locale === 'ru'
        ? ['если проверка', 'я проверяю', 'вижу кот. Далее', 'пример 12']
        : ['the examples', 'a table', 'hello cat. Next', 'example 12'];
    const content = '$100 12345 1.25 1/2 2026-10-08 +7-999-123-45-67 word word MiXeD мiкс 😀 е́';
    const addresses = 'https://example.com/the/a user@example.com';
    const input = `${phrases.join('\n')}\n${content}\n${addresses}\n${protectedText}`;
    const normalized = `${phrases.map((phrase) => phrase.replace(' ', '\u00a0')).join('\n')}\n${content}\n${addresses}\n${protectedText}`;
    const expected = legacy.format(normalized);

    expect(service.format(input)).toBe(expected);
    const repeated = expected;

    expect(service.format(expected)).toBe(repeated);
    expect(service.format(repeated)).toBe(repeated);
    expect(expected.replaceAll('\u00ad', '').replace(/\s/g, '')).toBe(input.replace(/\s/g, ''));
    expect(new Typographist({ ...configuration, categories: [], protectedContent }).format(input)).toBe(input);
    expect(
      new Typographist({
        ...configuration,
        categories: ['spacing', 'hyphenation'],
        protectedContent,
      }).format(input),
    ).toBe(legacy.format(`${phrases.join('\n')}\n${content}\n${addresses}\n${protectedText}`));
  });
});
