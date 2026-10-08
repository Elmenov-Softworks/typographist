import { createBundledNonbreakingSpacing } from '@/text/typography/bundled-nonbreaking-spacing.factory.js';
import { prepareTextPipeline } from '@/text/typography/prepare-text-pipeline.util.js';
import { Typographist } from '@/typographist/typographist.js';

const id = 'common/nbsp/replaceNbsp';

describe.each(['ru', 'en'] as const)('NBSP normalization for %s', (locale) => {
  const rules = createBundledNonbreakingSpacing(locale).filter((rule) => rule.id === id);
  const format = prepareTextPipeline(rules, locale);

  it.each([
    ['', ''],
    ['\u00a0\u00a0', '  '],
    ['long\u00a0words\u00a0here', 'long words here'],
    ['😀\u00a0е́\r\n\t\u202f\u2009\u00ad', '😀 е́\r\n\t\u202f\u2009\u00ad'],
    ['$100\u00a0100 руб.\u00a012345 1.25 1/2 2026-10-08', '$100 100 руб. 12345 1.25 1/2 2026-10-08'],
  ])('changes only U+00A0 in %j', (text, expected) => {
    expect(format(text)).toBe(expected);
    expect(format(expected)).toBe(expected);
    expect(expected.replace(/\s/g, '')).toBe(text.replace(/\s/g, ''));
  });

  it('rejects undeclared settings', () => {
    expect(() => prepareTextPipeline(rules, locale, { settings: { [id]: { unknown: true } } })).toThrow(
      'Invalid setting',
    );
  });

  it('respects category selection and protected content', () => {
    for (const categories of [[], ['quotes'], ['hyphenation']] as const) {
      expect(new Typographist({ locale, categories }).format('long\u00a0words')).toBe('long\u00a0words');
    }
    const service = new Typographist({
      locale,
      categories: ['nonbreakingSpacing'],
      protectedContent: ['kept\u00a0literal'],
    });

    expect(service.format('kept\u00a0literal long\u00a0words https://example.com user@example.com')).toBe(
      'kept\u00a0literal long words https://example.com user@example.com',
    );
  });

  it.each([false, true])('runs before cleanup and rebinding with useFast=%s', (useFast) => {
    const service = new Typographist({ locale, useFast });
    const legacy = new Typographist({ locale, useFast, categories: ['hyphenation'] });
    const text = locale === 'ru' ? 'Типографика\u00a0  работает в\u00a0тексте' : 'Typography\u00a0  works in\u00a0text';
    const normalized = locale === 'ru' ? 'Типографика работает в\u00a0тексте' : 'Typography works in\u00a0text';
    const expected = legacy.format(normalized);

    expect(service.format(text)).toBe(expected);
    expect(service.format(expected)).toBe(expected);
  });
});

it('supplies no implicit normalization to consumer locales', () => {
  expect(createBundledNonbreakingSpacing('custom')).toEqual([]);
});
