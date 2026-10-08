import { createBundledDashes } from '@/text/typography/bundled-dashes.factory.js';
import { prepareTextPipeline } from '@/text/typography/prepare-text-pipeline.util.js';
import { Typographist } from '@/typographist/typographist.js';

describe('bundled prose dashes', () => {
  it.each(['en', 'ru'] as const)('matches reference glyph and whitespace cases for %s', (locale) => {
    const rules = createBundledDashes(locale);
    const format = prepareTextPipeline(rules, locale);

    for (const dash of ['-', '--', '‒', '–', '—']) {
      for (const before of [' ', '\u00a0']) {
        for (const after of [' ', '\u00a0', '\n']) {
          expect(format(`word${before}${dash}${after}next`)).toBe(`word\u00a0—${after}next`);
        }
      }
    }

    const unchanged = '- start a-b 1-2 -3 2026-10-08 +7-999-123-45-67 a --- b a\t- b a -\tb a − b';

    expect(format(unchanged)).toBe(unchanged);
    expect(format('end -')).toBe('end -');
    expect(format('')).toBe('');
    expect(format(' \r\n\t ')).toBe(' \r\n\t ');
    for (const rule of rules) {
      expect(() => prepareTextPipeline(rules, locale, { settings: { [rule.id]: { unknown: true } } })).toThrow(
        'Invalid setting',
      );
    }
  });

  it.each(['en', 'ru'] as const)('preserves composition, protections and category selection for %s', (locale) => {
    const service = new Typographist({ locale, categories: ['dashes'], protectedContent: ['Keep - this'] });
    const content = '$100 100 руб. 12345 1.25 1/2 2026-10-08 +7-999-123-45-67 word word MiXeD мiкс e\u0301 😀';
    const input = `${content} word - next https://example.com/a-b user-name@example.com Keep - this`;
    const output = `${content} word\u00a0— next https://example.com/a-b user-name@example.com Keep - this`;

    expect(service.format(input)).toBe(output);
    expect(service.format(output)).toBe(output);
    expect(new Typographist({ locale, categories: [] }).format(input)).toBe(input);
    expect(new Typographist({ locale, categories: ['punctuation'] }).format(input)).toBe(input);
  });

  it.each([false, true])('runs after spacing and before hyphenation with useFast=%s', (useFast) => {
    const service = new Typographist({ useFast });
    const legacy = new Typographist({ useFast, categories: ['hyphenation'] });

    expect(service.format('table  -  table')).toBe(legacy.format('table\u00a0— table'));
    expect(legacy.format('table - table')).toBe(`${legacy.format('table')} - ${legacy.format('table')}`);
  });

  it('does not bundle dashes for consumer locales', () => {
    expect(createBundledDashes('custom')).toEqual([]);
  });
});
