import { createBundledNonbreakingSpacing } from '@/text/typography/bundled-nonbreaking-spacing.factory.js';
import { prepareTextPipeline } from '@/text/typography/prepare-text-pipeline.util.js';
import { Typographist } from '@/typographist/typographist.js';

describe.each(['ru', 'en'] as const)('resolution-unit spacing for %s', (locale) => {
  const id = 'common/nbsp/dpi';
  const rules = createBundledNonbreakingSpacing(locale).filter((rule) => rule.id === id);
  const format = prepareTextPipeline(rules, locale);

  it.each([
    ['300dpi', '300 dpi'],
    ['150 lpi.', '150 lpi.'],
    ['1.25dpi 1/2lpi', '1.25 dpi 1/2lpi'],
    ['😀 12345dpí', '😀 12345 dpí'],
    ['MiXeD300dpiЖ', 'MiXeD300 dpiЖ'],
    ['2026-10-08dpi', '2026-10-08 dpi'],
  ])('formats the first reference match in %j', (text, expected) => {
    expect(format(text)).toBe(expected);
  });

  it.each([
    '',
    ' \r\n\t',
    '300 DPI',
    '300 Lpi',
    '300\tdpi',
    '300\ndpi',
    '300  dpi',
    '300 dpi',
    '300dpi2',
    '300dpi_',
    '300dpix',
    'dpi300',
  ])('preserves %j', (text) => {
    expect(format(text)).toBe(text);
  });

  it('preserves reference traversal on repeated formatting', () => {
    const once = format('300dpi 150lpi');

    expect(once).toBe('300 dpi 150lpi');
    expect(format(once)).toBe('300 dpi 150 lpi');
    expect(format(format(once))).toBe('300 dpi 150 lpi');
  });

  it('rejects settings and does not supply rules to consumer locales', () => {
    expect(() => prepareTextPipeline(rules, locale, { settings: { [id]: { unknown: true } } })).toThrow(
      'Invalid setting',
    );
    expect(createBundledNonbreakingSpacing('custom')).toEqual([]);
  });

  it('respects category selection and protected content', () => {
    const text = '300dpi';
    const service = new Typographist({ locale, categories: ['nonbreakingSpacing'], protectedContent: [text] });

    expect(service.format(`${text} https://example.com/150dpi 150lpi@example.com`)).toBe(
      `${text} https://example.com/150dpi 150lpi@example.com`,
    );
    for (const categories of [[], ['spacing'], ['hyphenation']] as const) {
      expect(new Typographist({ locale, categories }).format(text)).toBe(text);
    }
    expect(new Typographist({ locale, categories: ['nonbreakingSpacing'] }).format(text)).toBe('300 dpi');
  });

  it.each([false, true])('combines ordinary spacing and hyphenation with useFast=%s', (useFast) => {
    const service = new Typographist({ locale, useFast });
    const legacy = new Typographist({ locale, useFast, categories: ['hyphenation'] });
    const expected = legacy.format('Resolution 300 dpi');

    expect(service.format('Resolution 300  dpi')).toBe(expected);
    expect(service.format(expected)).toBe(expected);
  });
});
