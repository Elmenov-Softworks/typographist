import { createBundledPunctuation } from '@/text/typography/bundled-punctuation.factory.js';
import { prepareTextPipeline } from '@/text/typography/prepare-text-pipeline.util.js';
import { Typographist } from '@/typographist/typographist.js';

const scenarios = [
  {
    locale: 'ru',
    id: 'ru/punctuation/hellipQuestion',
    input: '?… !... …,',
    output: '?.. !.. …',
    unchanged: '..... ?..',
  },
  { locale: 'ru', id: 'ru/punctuation/exclamation', input: '!! !!!!', output: '! !!!', unchanged: '! !!! !!!!!' },
  { locale: 'ru', id: 'ru/punctuation/exclamationQuestion', input: '!?', output: '?!', unchanged: '!!? !?? ?!' },
  { locale: 'ru', id: 'common/punctuation/hellip', input: '... ....', output: '… …', unchanged: '.. .....' },
  { locale: 'en', id: 'common/punctuation/hellip', input: '... ....', output: '… ….', unchanged: '.. .....' },
  {
    locale: 'en',
    id: 'common/punctuation/delDoublePunctuation',
    input: ',, :: .. ;; ??',
    output: ', : . ; ?',
    unchanged: ',,, ::: ... ;;; ??? !.. ?..',
  },
];

describe('bundled punctuation reference scenarios', () => {
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

    expect(output).toBe('Что?.. Да! Нет?! …');
    expect(service.format(output)).toBe(output);
  });

  it('retains reference behavior when adjacent exclamation runs need a second pass', () => {
    const service = new Typographist({ locale: 'ru', categories: ['punctuation'] });

    expect(service.format('!! !!')).toBe('! !!');
    expect(service.format('! !!')).toBe('! !');
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
