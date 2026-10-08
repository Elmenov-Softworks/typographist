import { createBundledSpacing } from '@/text/typography/bundled-spacing.factory.js';
import { prepareTextPipeline } from '@/text/typography/prepare-text-pipeline.util.js';
import { Typographist } from '@/typographist/typographist.js';

const id = 'common/space/insertFinalNewline';
const settings = { [id]: { enabled: true } };

describe.each(['ru', 'en'] as const)('Final newline for %s', (locale) => {
  const rules = createBundledSpacing(locale).filter((rule) => rule.id === id);
  const format = prepareTextPipeline(rules, locale, { settings });

  it.each([
    ['', '\n'],
    ['text', 'text\n'],
    ['text\n', 'text\n'],
    ['text\r\n', 'text\r\n'],
    ['text\r', 'text\r\n'],
    [' \t ', ' \t \n'],
    ['😀 é\u00a0word\u00ad', '😀 é\u00a0word\u00ad\n'],
    [
      '$100 100 руб. 12345 1.25 1/2 2026-10-08 word word MiXeD',
      '$100 100 руб. 12345 1.25 1/2 2026-10-08 word word MiXeD\n',
    ],
  ])('matches the reference for %j', (input, expected) => {
    expect(format(input)).toBe(expected);
    expect(format(expected)).toBe(expected);
    expect(prepareTextPipeline(rules, locale)(input)).toBe(input);
  });

  it('validates settings and respects category selection', () => {
    expect(() => prepareTextPipeline(rules, locale, { settings: { [id]: { enabled: 'yes' } } })).toThrow(
      'Invalid setting',
    );
    expect(() => prepareTextPipeline(rules, locale, { settings: { [id]: { unknown: true } } })).toThrow(
      'Invalid setting',
    );
    expect(new Typographist({ locale, categories: [], settings }).format('text')).toBe('text');
    expect(new Typographist({ locale, categories: ['punctuation'], settings }).format('text')).toBe('text');
    expect(createBundledSpacing('custom')).toEqual([]);
  });

  it('appends once after protected terminal content without changing protected bytes', () => {
    const service = new Typographist({ locale, categories: ['spacing'], settings, protectedContent: ['keep\r'] });

    expect(service.format('first https://example.com/path')).toBe('first https://example.com/path\n');
    expect(service.format('first user@example.com')).toBe('first user@example.com\n');
    expect(service.format('keep\r')).toBe('keep\r\n');
    expect(service.format('https://example.com/path next')).toBe('https://example.com/path next\n');
  });

  it.each([false, true])('runs after trimming and before hyphenation with useFast=%s', (useFast) => {
    const service = new Typographist({ locale, useFast, settings });
    const legacy = new Typographist({ locale, useFast, categories: ['hyphenation'] });

    const expected = `${legacy.format('typography')}\n`;

    expect(service.format(' typography \r\n')).toBe(expected);
    expect(service.format(expected)).toBe(expected);
  });
});
