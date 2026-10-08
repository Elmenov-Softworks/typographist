import { createBundledDashes } from '@/text/typography/bundled-dashes.factory.js';
import { prepareTextPipeline } from '@/text/typography/prepare-text-pipeline.util.js';
import { Typographist } from '@/typographist/typographist.js';

const id = 'common/dash/minus';

describe.each(['en', 'ru'] as const)('Unary minus formatting for %s', (locale) => {
  const rules = createBundledDashes(locale).filter((rule) => rule.id === id);
  const format = prepareTextPipeline(rules, locale);

  it.each([
    ['-3', '−3'],
    ['(-001.25), [-1/2]; {-1,25}!', '(−001.25), [−1/2]; {−1,25}!'],
    ['😀 -12345.\r\n-0\t-100', '😀 −12345.\r\n−0\t−100'],
    [
      '−3 +3 1-2 2026-10-08 +7-999-123-45-67 -7-999-123-45-67',
      '−3 +3 1-2 2026-10-08 +7-999-123-45-67 -7-999-123-45-67',
    ],
    ['id-3 _-3 -3suffix -3_foo -3-е -1e-3 -1. -1/ -1..2', 'id-3 _-3 -3suffix -3_foo -3-е -1e-3 −1. -1/ -1..2'],
    ['-3м -3é -3\u00adfoo --3 –3 —3 - 3', '-3м -3é -3\u00adfoo --3 –3 —3 - 3'],
    ['$100 100 руб. 12345 1.25 1/2 word word MiXeD мiкс', '$100 100 руб. 12345 1.25 1/2 word word MiXeD мiкс'],
    ['-1,25suffix -1/2suffix -1.25suffix', '-1,25suffix -1/2suffix -1.25suffix'],
    ['', ''],
    [' \r\n\t ', ' \r\n\t '],
  ])('normalizes only a standalone unary hyphen in %j', (input, expected) => {
    expect(format(input)).toBe(expected);
    expect(format(expected)).toBe(expected);
  });

  it.each([
    ['id', 'id-3 (-4)', 'id-3 (−4)'],
    ['suffix', '-3suffix -4', '-3suffix −4'],
    ['id', 'id-2020-2025 гг. -4', 'id-2020-2025 гг. −4'],
    ['suffix', 'X-Vsuffix -4', 'X-Vsuffix −4'],
    ['_', '_-3 -3_ -4', '_-3 -3_ −4'],
    ['𐐀', '𐐀-3 -3𐐀 -4', '𐐀-3 -3𐐀 −4'],
    ['keep', 'keep -3 -4 keep', 'keep −3 −4 keep'],
  ])('preserves identifier boundaries around protected %j', (protectedLiteral, input, expected) => {
    const service = new Typographist({ locale, categories: ['dashes'], protectedContent: [protectedLiteral] });

    expect(service.format(input)).toBe(expected);
    expect(service.format(expected)).toBe(expected);
  });

  it('validates settings and keeps consumer locales explicit', () => {
    expect(() => prepareTextPipeline(rules, locale, { settings: { [id]: { unknown: true } } })).toThrow(
      'Invalid setting',
    );
    expect(createBundledDashes('custom')).toEqual([]);
  });

  it('respects categories and protected content', () => {
    const service = new Typographist({ locale, categories: ['dashes'], protectedContent: ['keep -3'] });
    const input = 'keep -3 (-4) https://example.com/-5 user-6@example.com';

    expect(service.format(input)).toBe('keep -3 (−4) https://example.com/-5 user-6@example.com');
    for (const categories of [[], ['spacing'], ['punctuation'], ['quotes']] as const) {
      expect(new Typographist({ locale, categories }).format('-3')).toBe('-3');
    }
  });

  it.each([false, true])('combines prose dashes and hyphenation with useFast=%s', (useFast) => {
    const service = new Typographist({ locale, useFast });
    const legacy = new Typographist({ locale, useFast, categories: ['hyphenation'] });

    expect(service.format('typography - next (-1.25)')).toBe(legacy.format('typography\u00a0— next (−1.25)'));
    expect(legacy.format('-1.25')).toBe('-1.25');
  });
});
