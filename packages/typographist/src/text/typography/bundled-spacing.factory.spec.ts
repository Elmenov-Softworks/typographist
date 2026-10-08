import { createBundledSpacing } from '@/text/typography/bundled-spacing.factory.js';
import { prepareTextPipeline } from '@/text/typography/prepare-text-pipeline.util.js';
import { Typographist } from '@/typographist/typographist.js';

const scenarios = [
  { id: 'common/space/replaceTab', input: '\ta\tb', output: '    a    b', unchanged: 'a  b\u00a0c' },
  { id: 'common/space/delTrailingBlanks', input: 'a  \nb\t\n', output: 'a\nb\n', unchanged: 'a  \r\nb  ' },
  { id: 'common/space/delRepeatSpace', input: 'a  b\t\tc', output: 'a b c', unchanged: '  a\n  b\u00a0\u00a0c' },
  { id: 'common/space/squareBracket', input: '[  a  ]', output: '[a]', unchanged: '[\ta\t] ( a )' },
];

describe('bundled spacing reference scenarios', () => {
  it.each(['en', 'ru'] as const)('matches isolated rule behavior for %s', (locale) => {
    for (const { id, input, output, unchanged } of scenarios) {
      const rules = createBundledSpacing(locale).filter((rule) => rule.id === id);
      const format = prepareTextPipeline(rules, locale);

      expect(rules).toHaveLength(1);
      expect(format(input)).toBe(output);
      expect(format(unchanged)).toBe(unchanged);
      expect(() => prepareTextPipeline(rules, locale, { settings: { [id]: { unknown: true } } })).toThrow(
        'Invalid setting',
      );
    }
  });

  it.each(['en', 'ru'] as const)('preserves composition and protected content for %s', (locale) => {
    const service = new Typographist({ locale, categories: ['spacing'], protectedContent: ['Keep\t  this'] });
    const content = '$100 100 руб. 12345 1.25 1/2 2026-10-08 +7-999-123-45-67 word word MiXeD мiкс e\u0301 😀';
    const addresses = 'https://example.com/a user@example.com';

    expect(service.format(`${content}\tend`)).toBe(`${content} end`);
    expect(service.format(`before ${addresses} after Keep\t  this end`)).toBe(
      `before ${addresses} after Keep\t  this end`,
    );
    expect(service.format('')).toBe('');
    expect(service.format(' \r\n\t ')).toBe(' \r\n     ');
    expect(service.format('a\u00adb\u00a0c')).toBe('a\u00adb\u00a0c');
  });

  it.each([false, true])('orders spacing before hyphenation with useFast=%s', (useFast) => {
    const service = new Typographist({ useFast, categories: ['spacing', 'hyphenation'] });
    const legacy = new Typographist({ useFast, categories: ['hyphenation'] });
    const output = service.format('[  table\tword  ]  \nnext');

    expect(output).toBe(legacy.format('[table word]\nnext'));
    expect(service.format(output)).toBe(output);
    expect(legacy.format('a\tb')).toBe('a\tb');
    expect(new Typographist({ categories: [] }).format('a\tb')).toBe('a\tb');
  });

  it('does not bundle spacing for consumer locales', () => {
    expect(createBundledSpacing('custom')).toEqual([]);
    const service = new Typographist({
      rules: [],
      locale: 'custom',
      textLocales: [{ locale: 'custom', textRules: [] }],
    });

    expect(service.format('[  a\tb  ]')).toBe('[  a\tb  ]');
  });
});
