import { createBundledSpacing } from '@/text/typography/bundled-spacing.factory.js';
import { prepareTextPipeline } from '@/text/typography/prepare-text-pipeline.util.js';
import { Typographist } from '@/typographist/typographist.js';

const id = 'common/space/normalizeLineEndings';

describe.each(['en', 'ru'] as const)('Line-ending preparation for %s', (locale) => {
  const rules = createBundledSpacing(locale).filter((rule) => rule.id === id);
  const format = prepareTextPipeline(rules, locale);

  it.each([
    ['', ''],
    ['\r\n\r\n', '\n\n'],
    ['first\rsecond\r\nthird\nfourth', 'first\nsecond\nthird\nfourth'],
    ['\r\r\n\n', '\n\n\n'],
    ['😀 е́\u2028word\u2029text\r\n', '😀 е́\u2028word\u2029text\n'],
  ])('normalizes CR without changing other characters in %j', (input, expected) => {
    expect(format(input)).toBe(expected);
    expect(format(expected)).toBe(expected);
  });

  it('rejects undeclared settings', () => {
    expect(() => prepareTextPipeline(rules, locale, { settings: { [id]: { enabled: false } } })).toThrow(
      'Invalid setting',
    );
  });

  it.each([[], ['hyphenation'], ['quotes'], ['nonbreakingSpacing']] as const)(
    'preserves line endings when spacing is absent: %j',
    (...categories) => {
      const service = new Typographist({ locale, categories });

      expect(service.format('😀\r\n😀\r😀')).toBe('😀\r\n😀\r😀');
    },
  );
});

it.each(
  (['en', 'ru'] as const).flatMap((locale) =>
    [false, true].flatMap((useFast) => [0, 64].map((cacheSize) => ({ locale, useFast, cacheSize }))),
  ),
)('prepares line endings before cleanup for $locale, useFast=$useFast, cacheSize=$cacheSize', (configuration) => {
  const protectedContent = ['Keep\r\n  literal\rtext'];
  const service = new Typographist({
    ...configuration,
    categories: ['spacing', 'hyphenation'],
    protectedContent,
  });
  const legacy = new Typographist({ ...configuration, categories: ['hyphenation'], protectedContent });
  const input = '\tTypography  \r\n\r\n\r\n  Типографика\r  😀 е́\r\nKeep\r\n  literal\rtext\r  end  ';
  const cleaned = 'Typography\n\nТипографика\n😀 е́\nKeep\r\n  literal\rtext\nend';
  const expected = legacy.format(cleaned);

  expect(service.format(input)).toBe(expected);
  expect(service.format(expected)).toBe(expected);
  expect(legacy.format(input).replaceAll('\u00ad', '')).toBe(input);
  expect(expected.replaceAll('\u00ad', '').replace(/\s/g, '')).toBe(input.replace(/\s/g, ''));

  const full = new Typographist({ ...configuration, protectedContent });
  const prose = 'Typography  works\r\nТипографика  работает\r$100 1.25 1/2 2026-10-08\r\n';
  const addresses = 'https://example.com user@example.com\r\nKeep\r\n  literal\rtext';
  const normalized = prose.replace(/\r\n?/g, '\n') + addresses.replace('com\r\nKeep', 'com\nKeep');

  expect(full.format(prose + addresses)).toBe(full.format(normalized));
});

it('supplies no implicit line-ending preparation to consumer locales', () => {
  expect(createBundledSpacing('custom')).toEqual([]);
});
