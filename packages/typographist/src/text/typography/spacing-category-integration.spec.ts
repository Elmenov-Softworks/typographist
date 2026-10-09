import { Typographist } from '@/index.js';

it('runs explicitly selected consumer spacing rules without builtin cleanup', () => {
  const rule = {
    id: 'custom/gap',
    category: 'spacing' as const,
    order: 400,
    defaults: {},
    prepare: () => (text: string) => text.replaceAll('~~', '\u00a0'),
  };
  const service = new Typographist({ categories: ['spacing'], textRules: [rule], protectedContent: ['Keep~~this'] });
  const input = '  word~~word\t Keep~~this https://example.com/a~~b user@example.com \r\n';

  expect(service.format(input)).toBe('  word\u00a0word\t Keep~~this https://example.com/a~~b user@example.com \r\n');
  expect(new Typographist({ textRules: [rule] }).format('cat~~dog')).toBe('cat~~dog');
});

it.each(
  (['en', 'ru'] as const).flatMap((locale) =>
    [false, true].flatMap((useFast) => [0, 64].map((cacheSize) => ({ locale, useFast, cacheSize }))),
  ),
)('preserves gaps through hyphenation for $locale, useFast=$useFast, cacheSize=$cacheSize', (config) => {
  const service = new Typographist({ ...config, categories: ['spacing', 'hyphenation'] });
  const hyphenation = new Typographist({ ...config, categories: ['hyphenation'] });
  const input =
    '\tTypography  Типографика (  text  ) word,next!last?end 25 % \r\n\r\nhttps://example.com/a,b user@example.com\t ';
  const expected = hyphenation.format(input);

  expect(expected).toContain('\u00ad');
  expect(expected.replaceAll('\u00ad', '')).toBe(input);
  expect(service.format(input)).toBe(expected);
  expect(service.format(expected)).toBe(expected);
});
