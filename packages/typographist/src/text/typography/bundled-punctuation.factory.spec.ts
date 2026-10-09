import { createBundledPunctuation } from '@/text/typography/bundled-punctuation.factory.js';
import { prepareTextPipeline } from '@/text/typography/prepare-text-pipeline.util.js';
import { Typographist } from '@/typographist/typographist.js';

const scenarios = [
  {
    locale: 'en',
    id: 'common/punctuation/apostrophe',
    input: "Don't O'NEIL a'b'c д'Артаньян Ё'Ж",
    output: "Don’t O’NEIL a’b'c д'Артаньян Ё'Ж",
    unchanged: "'word' 1'2 a'я e\u0301'a 😀'a a’b",
  },
  {
    locale: 'ru',
    id: 'common/punctuation/apostrophe',
    input: "Don't O'NEIL a'b'c д'Артаньян Ё'Ж",
    output: "Don't O'NEIL a'b'c д’Артаньян Ё’Ж",
    unchanged: "'word' 1'2 a'я e\u0301'a 😀'a a’b",
  },
  { locale: 'ru', id: 'common/punctuation/hellip', input: '... ....', output: '… …', unchanged: '.. .....' },
  { locale: 'en', id: 'common/punctuation/hellip', input: '... ....', output: '… ….', unchanged: '.. .....' },
];

describe('bundled punctuation reference scenarios', () => {
  it.each(['en', 'ru'] as const)('normalizes apostrophes with protection and category selection for %s', (locale) => {
    const service = new Typographist({ locale, categories: ['punctuation'], protectedContent: ["Keep'this д'Ар"] });
    const content = '$100 100 руб. 12345 1.25 1/2 2026-10-08 +7-999-123-45-67 word word MiXeD мiкс';
    const input = `${content} Don't д'Артаньян https://example.com/a'b user@example.com Keep'this д'Ар`;
    const output = `${content} ${locale === 'en' ? "Don’t д'Артаньян" : "Don't д’Артаньян"} https://example.com/a'b user@example.com Keep'this д'Ар`;

    expect(service.format(input)).toBe(output);
    expect(service.format(output)).toBe(output);
    expect(new Typographist({ locale, categories: [] }).format(input)).toBe(input);
    expect(new Typographist({ locale, categories: ['spacing'] }).format(input)).toBe(input);
    expect(new Typographist({ locale, categories: ['hyphenation'] }).format("a'b я'ё")).toBe("a'b я'ё");
  });

  it('retains reference apostrophe traversal across repeated passes', () => {
    const service = new Typographist({ categories: ['punctuation'] });

    expect(service.format("a'b'c")).toBe("a’b'c");
    expect(service.format("a’b'c")).toBe('a’b’c');
  });
  it.each(scenarios)(
    '$locale $id preserves reference positive and negative cases',
    ({ locale, id, input, output, unchanged }) => {
      const rules = createBundledPunctuation(locale).filter((rule) => rule.id === id);
      const format = prepareTextPipeline(rules, locale);

      expect(rules).toHaveLength(1);
      expect(format(input)).toBe(output);
      expect(format(unchanged)).toBe(unchanged);
      expect(() => prepareTextPipeline(rules, locale, { settings: { [id]: { unknown: true } } })).toThrow(
        'Invalid setting',
      );
    },
  );

  it.each(['en', 'ru'] as const)('preserves protected and lexical content for %s', (locale) => {
    const service = new Typographist({ locale, categories: ['punctuation'], protectedContent: ['Keep...'] });
    const input =
      'Keep... https://example.com/a... user@example.com $100 100 руб. 12345 1.25 1/2 2026-10-08 +7-999-123-45-67 word word MiXeD мiкс e\u0301 😀';

    expect(service.format(input)).toBe(input);
    expect(service.format('')).toBe('');
    expect(service.format(' \r\n\t ')).toBe(' \r\n\t ');
  });

  it('runs Russian interactions in reference order and remains stable', () => {
    const service = new Typographist({ locale: 'ru', categories: ['punctuation'] });
    const output = service.format('Что?... Да!! Нет!? ....');

    expect(output).toBe('Что?… Да!! Нет!? …');
    expect(service.format(output)).toBe(output);
  });

  it.each(['en', 'ru'] as const)('converts ellipsis while preserving repeated punctuation for %s', (locale) => {
    const service = new Typographist({ locale, categories: ['punctuation'] });
    const input = 'word.... word.. word...,, word?? word:: word;;';
    const output = `word${locale === 'ru' ? '…' : '….'} word.. word…,, word?? word:: word;;`;

    expect(service.format(input)).toBe(output);
    expect(service.format(output)).toBe(output);
    expect(new Typographist({ locale, categories: [] }).format(input)).toBe(input);
    expect(new Typographist({ locale, categories: ['hyphenation'] }).format('a.. a??')).toBe('a.. a??');
  });

  it.each(['en', 'ru'] as const)('preserves repeated signs and whitespace for %s', (locale) => {
    const service = new Typographist({ locale, categories: ['punctuation'] });
    const input = '  !! !!!! !? ?? ,, :: ;; .. …, ?… !…\t\r\n  \n';

    expect(service.format(input)).toBe(input);
    expect(service.format(service.format(input))).toBe(input);
  });

  it.each([
    'common/punctuation/delDoublePunctuation',
    'ru/punctuation/hellipQuestion',
    'ru/punctuation/exclamation',
    'ru/punctuation/exclamationQuestion',
  ])('rejects removed rule settings for %s', (id) => {
    expect(() => new Typographist({ locale: 'ru', settings: { [id]: {} } })).toThrow(`Unknown text rule: ${id}`);
  });

  it.each([false, true])('runs punctuation before hyphenation with useFast=%s', (useFast) => {
    const service = new Typographist({ useFast });
    const legacy = new Typographist({ useFast, categories: ['hyphenation'] });

    expect(service.format('table...')).toBe(legacy.format('table…'));
    expect(legacy.format('table...')).toBe(`${legacy.format('table')}...`);
    expect(new Typographist({ categories: [] }).format('table...')).toBe('table...');
  });

  it('does not install bundled rules for consumer locales', () => {
    const service = new Typographist({
      rules: [],
      locale: 'custom',
      textLocales: [{ locale: 'custom', textRules: [] }],
    });

    expect(service.format('... !!')).toBe('... !!');
  });
});
