import { createBundledQuotes } from '@/text/typography/bundled-quotes.factory.js';
import { prepareTextPipeline } from '@/text/typography/prepare-text-pipeline.util.js';

const fixtures = [
  ['"hello"', '“hello”', '«hello»'],
  ['"one "two" three"', '“one ‘two’ three”', '«one „two“ three»'],
  ['"one "two "three" two" one"', '“one ‘two ‘three’ two” one”', '«one „two ‚three‘ two“ one»'],
  ['"open', '“open', '«open'],
  ['close"', 'close”', 'close»'],
  ['"word", "next"!', '“word”, “next”!', '«word», «next»!'],
  ['(“word”)', '(“word”)', '(«word»)'],
  ['"a"\n"b"', '“a”\n“b”', '«a»\n«b»'],
  ['"😀 é"', '“😀 é”', '«😀 é»'],
  ['" "', '" "', '" "'],
  ["'word' Don't", "'word' Don't", "'word' Don't"],
  ['', '', ''],
  [' \r\n\t ', ' \r\n\t ', ' \r\n\t '],
  [
    '$100 100 руб. 12345 1.25 1/2 2026-10-08 word word MiXeD мiкс',
    '$100 100 руб. 12345 1.25 1/2 2026-10-08 word word MiXeD мiкс',
    '$100 100 руб. 12345 1.25 1/2 2026-10-08 word word MiXeD мiкс',
  ],
];

describe('bundled quotation preparation', () => {
  describe.each(['en', 'ru'])('%s reference fixtures', (locale) => {
    const format = prepareTextPipeline(createBundledQuotes(locale), locale, {
      categories: ['quotes'],
      settings: { 'common/punctuation/quote': { spacing: false } },
    });

    it.each(fixtures)('formats %j', (input, english, russian) => {
      expect(format(input)).toBe(locale === 'ru' ? russian : english);
    });
  });

  it('honors category selection and literal protection', () => {
    const rules = createBundledQuotes('en');
    const format = prepareTextPipeline(rules, 'en', {
      protectedContent: ['"Keep"'],
      settings: { 'common/punctuation/quote': { spacing: false } },
    });

    expect(format('"Keep" "change" https://example.com/a user@example.com')).toBe(
      '"Keep" “change” https://example.com/a user@example.com',
    );
    expect(prepareTextPipeline(rules, 'en', { categories: [] })('"word"')).toBe('"word"');
    expect(createBundledQuotes('custom')).toEqual([]);
  });
});
