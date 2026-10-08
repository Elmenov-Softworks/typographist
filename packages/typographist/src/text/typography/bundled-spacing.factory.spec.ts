import { createBundledSpacing } from '@/text/typography/bundled-spacing.factory.js';
import { prepareTextPipeline } from '@/text/typography/prepare-text-pipeline.util.js';
import { Typographist } from '@/typographist/typographist.js';

const scenarios = [
  {
    id: 'common/space/afterExclamationMark',
    input: '!start word!next слово!далее 1!2 !, !: !/ !\\ !( !😀',
    output: '! start word! next слово! далее 1! 2 ! , ! : ! / ! \\ ! ( ! 😀',
    unchanged: '!. !… !! !; !? ![ !] !) !« !‹ !» !› !„ !“ !‟ !” !" ! next !\t !\n !\u00a0',
  },
  {
    id: 'common/space/afterQuestionMark',
    input: '?start word?next слово?далее 1?2 ?, ?: ?/ ?\\ ?( ?😀',
    output: '? start word? next слово? далее 1? 2 ? , ? : ? / ? \\ ? ( ? 😀',
    unchanged: '?. ?… ?! ?; ?? ?[ ?] ?) ?« ?‹ ?» ?› ?„ ?“ ?‟ ?” ?" ? next ?\t ?\n ?\u00a0',
  },
  {
    id: 'common/space/afterComma',
    input: 'word,next слово,далее 1,a a,1 a,( a,😀',
    output: 'word, next слово, далее 1, a a, 1 a, ( a, 😀',
    unchanged: ',start 1,25 a,) a," a,, a,: a,. a,? a,/ a,\\ a, next a,\u00a0next',
  },
  {
    id: 'common/space/afterSemicolon',
    input: ';start word;next слово;далее 1;2 ;, ;: ;/ ;\\ ;( ;😀',
    output: '; start word; next слово; далее 1; 2 ; , ; : ; / ; \\ ; ( ; 😀',
    unchanged: ';. ;… ;! ;; ;? ;[ ;] ;) ;« ;‹ ;» ;› ;„ ;“ ;‟ ;” ;" ; next ;\t ;\n ;\u00a0',
  },
  {
    id: 'common/space/afterColon',
    input: 'word:next слово:далее a:1',
    output: 'word: next слово: далее a: 1',
    unchanged: ':start 12:30 1:2 a:) a:" a:, a:. a:? a:/ a:\\ a: next a:\u00a0next',
  },
  {
    id: 'common/space/delBetweenExclamationMarks',
    input: 'a! ! ? ? b',
    output: 'a!!?? b',
    unchanged: 'a!  ! b?\t? c!\u00a0!',
  },
  {
    id: 'common/space/delBeforeDot',
    input: 'a . b ... c .\n',
    output: 'a. b... c.\n',
    unchanged: '1 .25 a .b a .. ! . a\t. a\u00a0.',
  },
  { id: 'common/space/bracket', input: '(  a  )', output: '(a)', unchanged: '(\ta\t) [ a ]' },
  { id: 'common/space/delBeforePercent', input: '1 % 2\u00a0‰ 3 ‱', output: '1% 2‰ 3‱', unchanged: '1  % a % 2\t%' },
  {
    id: 'common/space/delBeforePunctuation',
    input: 'a ! b ? c : d ; e ,',
    output: 'a! b? c: d; e,',
    unchanged: 'a . ! ! :) a\t,',
  },
  { id: 'common/space/replaceTab', input: '\ta\tb', output: '    a    b', unchanged: 'a  b\u00a0c' },
  { id: 'common/space/delTrailingBlanks', input: 'a  \nb\t\n', output: 'a\nb\n', unchanged: 'a  \r\nb  ' },
  { id: 'common/space/delRepeatSpace', input: 'a  b\t\tc', output: 'a b c', unchanged: '  a\n  b\u00a0\u00a0c' },
  { id: 'common/space/squareBracket', input: '[  a  ]', output: '[a]', unchanged: '[\ta\t] ( a )' },
  { id: 'common/space/delRepeatN', input: 'a\n\n\n\nb', output: 'a\n\nb', unchanged: 'a\n\nb\r\n\r\n\r\nc' },
];

describe('bundled spacing reference scenarios', () => {
  it.each(['en', 'ru'] as const)('combines terminal punctuation spacing for %s', (locale) => {
    const service = new Typographist({
      locale,
      categories: ['spacing', 'punctuation'],
      protectedContent: ['Keep . ! !'],
    });
    const content = '$100 100 руб. 12345 1.25 1/2 2026-10-08 +7-999-123-45-67 word word MiXeD мiкс';
    const input = `${content} . Wait ... Really! ! https://example.com/a user@example.com Keep . ! !`;
    const output = `${content}. Wait… Really${locale === 'ru' ? '!' : '!!'} https://example.com/a user@example.com Keep . ! !`;

    expect(service.format(input)).toBe(output);
    expect(service.format(output)).toBe(output);
    expect(new Typographist({ locale, categories: [] }).format(input)).toBe(input);
    expect(new Typographist({ locale, categories: ['hyphenation'] }).format('a . ! !')).toBe('a . ! !');
  });

  it.each(['en', 'ru'] as const)('configures consecutive line breaks for %s', (locale) => {
    const id = 'common/space/delRepeatN';
    const rules = createBundledSpacing(locale).filter((rule) => rule.id === id);

    for (const maximum of [1, 2, 3, Number.MAX_SAFE_INTEGER]) {
      const format = prepareTextPipeline(rules, locale, {
        settings: { [id]: { maxConsecutiveLineBreaks: maximum } },
      });
      const expected = `a${'\n'.repeat(Math.min(4, maximum))}b`;

      expect(format('a\n\n\n\nb')).toBe(expected);
      expect(format(expected)).toBe(expected);
    }

    for (const maximum of [0, -1, 1.5, NaN, Infinity, Number.MAX_SAFE_INTEGER + 1, '2', true]) {
      expect(() =>
        prepareTextPipeline(rules, locale, { settings: { [id]: { maxConsecutiveLineBreaks: maximum } } }),
      ).toThrow();
    }
  });

  it.each(['en', 'ru'] as const)('preserves protected line breaks and content for %s', (locale) => {
    const protectedContent = 'Keep\n\n\nthis';
    const service = new Typographist({ locale, categories: ['spacing'], protectedContent: [protectedContent] });
    const content = '$100 100 руб. 12345 1.25 1/2 2026-10-08 +7-999-123-45-67 word word MiXeD мiкс e\u0301 😀';
    const input = `${content}\n\n\nhttps://example.com/a\n\n\nuser@example.com\n\n\n${protectedContent}`;
    const output = `${content}\n\nhttps://example.com/a\n\nuser@example.com\n\n${protectedContent}`;

    expect(service.format(input)).toBe(output);
    expect(service.format(output)).toBe(output);
    expect(service.format('\n\n\n')).toBe('\n\n');
    expect(new Typographist({ locale, categories: [] }).format(input)).toBe(input);
    expect(new Typographist({ locale, categories: ['hyphenation'] }).format('\n\n\n')).toBe('\n\n\n');
  });

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

  it.each(['en', 'ru'] as const)('combines punctuation spacing without rewriting content for %s', (locale) => {
    const service = new Typographist({ locale, categories: ['spacing'], protectedContent: ['Keep ( this ) 1 %'] });
    const input = '( $100 100 руб. 12345 1.25 1/2 2026-10-08 +7-999-123-45-67 word word MiXeD мiкс ) ; 10 %';
    const output = '($100 100 руб. 12345 1.25 1/2 2026-10-08 +7-999-123-45-67 word word MiXeD мiкс); 10%';

    expect(service.format(input)).toBe(output);
    expect(service.format(output)).toBe(output);
    expect(service.format('https://example.com/(a) user@example.com Keep ( this ) 1 %')).toBe(
      'https://example.com/(a) user@example.com Keep ( this ) 1 %',
    );
    expect(new Typographist({ locale, categories: [] }).format(input)).toBe(input);
    expect(new Typographist({ locale, categories: ['hyphenation'] }).format('1 % ( a ) ;')).toBe('1 % ( a ) ;');
  });

  it.each(['en', 'ru'] as const)('spaces opening parentheses using the %s alphabet', (locale) => {
    const id = 'common/space/beforeBracket';
    const rules = createBundledSpacing(locale).filter((rule) => rule.id === id);
    const format = prepareTextPipeline(rules, locale);
    const input = 'word(a) СЛОВО(б) ё(в) a.(b) !(c) ?(d) ,(e) ;(f) …(g) )(h)';
    const output =
      locale === 'ru'
        ? 'word(a) СЛОВО (б) ё (в) a. (b) ! (c) ? (d) , (e) ; (f) … (g) ) (h)'
        : 'word (a) СЛОВО(б) ё(в) a. (b) ! (c) ? (d) , (e) ; (f) … (g) ) (h)';

    expect(rules).toHaveLength(1);
    expect(format(input)).toBe(output);
    expect(format(output)).toBe(output);
    expect(format('1(2) [(a) :(b) -(c) e\u0301(d) 😀(e)')).toBe('1(2) [(a) :(b) -(c) e\u0301(d) 😀(e)');
    expect(() => prepareTextPipeline(rules, locale, { settings: { [id]: { unknown: true } } })).toThrow(
      'Invalid setting',
    );

    const service = new Typographist({ locale, categories: ['spacing'], protectedContent: ['Keep(a) слово(б)'] });
    const content = '$100 100 руб. 12345 1.25 1/2 2026-10-08 +7-999-123-45-67 word word MiXeD мiкс';
    const addresses = 'https://example.com/a(b) user@example.com';
    const lexicalInput = locale === 'ru' ? 'слово(  тест  )' : 'word(  test  )';
    const lexicalOutput = locale === 'ru' ? 'слово (тест)' : 'word (test)';

    expect(service.format(`${content} ${addresses} Keep(a) слово(б) ${lexicalInput}`)).toBe(
      `${content} ${addresses} Keep(a) слово(б) ${lexicalOutput}`,
    );
    expect(new Typographist({ locale, categories: [] }).format(input)).toBe(input);
    expect(new Typographist({ locale, categories: ['hyphenation'] }).format('a(b) я(б)')).toBe('a(b) я(б)');
  });

  it.each(['en', 'ru'] as const)('spaces colons while preserving notation and protection for %s', (locale) => {
    const service = new Typographist({ locale, categories: ['spacing'], protectedContent: ['Keep:this'] });
    const content = '$100 100 руб. 12345 1.25 1/2 2026-10-08 +7-999-123-45-67 word word MiXeD мiкс';
    const input = `${content} 12:30 https://example.com:8080/a user@example.com Keep:this word:next`;
    const output = `${content} 12:30 https://example.com:8080/a user@example.com Keep:this word: next`;

    expect(service.format(input)).toBe(output);
    expect(service.format(output)).toBe(output);
    expect(new Typographist({ locale, categories: [] }).format(input)).toBe(input);
    expect(new Typographist({ locale, categories: ['hyphenation'] }).format('a:b')).toBe('a:b');
  });

  it.each(['en', 'ru'] as const)('spaces semicolons with protected content for %s', (locale) => {
    const service = new Typographist({ locale, categories: ['spacing'], protectedContent: ['Keep;this'] });
    const content = '$100 100 руб. 12345 1.25 1/2 2026-10-08 +7-999-123-45-67 word word MiXeD мiкс e\u0301 😀';
    const input = `${content};next https://example.com/a;b user@example.com Keep;this`;
    const output = `${content}; next https://example.com/a;b user@example.com Keep;this`;

    expect(service.format(input)).toBe(output);
    expect(service.format(output)).toBe(output);
    expect(service.format('word ;next')).toBe('word; next');
    expect(new Typographist({ locale, categories: [] }).format(input)).toBe(input);
    expect(new Typographist({ locale, categories: ['hyphenation'] }).format('a;b')).toBe('a;b');
  });

  it.each(['en', 'ru'] as const)('spaces commas with locale quotes and protected content for %s', (locale) => {
    const id = 'common/space/afterComma';
    const format = prepareTextPipeline(
      createBundledSpacing(locale).filter((rule) => rule.id === id),
      locale,
    );

    expect(format('a,» a,“ a,‘ a,” a,’')).toBe(locale === 'ru' ? 'a,» a,“ a,‘ a, ” a, ’' : 'a, » a, “ a, ‘ a,” a,’');

    const service = new Typographist({ locale, categories: ['spacing'], protectedContent: ['Keep,this'] });
    const content = '$100 100 руб. 12345 1.25 1,25 1/2 2026-10-08 +7-999-123-45-67 word word MiXeD мiкс e\u0301 😀';
    const input = `${content},next https://example.com/a,b user@example.com Keep,this`;
    const output = `${content}, next https://example.com/a,b user@example.com Keep,this`;

    expect(service.format(input)).toBe(output);
    expect(service.format(output)).toBe(output);
    expect(service.format('word ,next')).toBe('word, next');
    expect(new Typographist({ locale, categories: [] }).format(input)).toBe(input);
    expect(new Typographist({ locale, categories: ['hyphenation'] }).format('a,b')).toBe('a,b');
  });

  it.each(['en', 'ru'] as const)('spaces question and exclamation marks with protection for %s', (locale) => {
    const service = new Typographist({ locale, categories: ['spacing'], protectedContent: ['Keep!this?here'] });
    const content = '$100 100 руб. 12345 1.25 1/2 2026-10-08 +7-999-123-45-67 word word MiXeD мiкс e\u0301 😀';
    const input = `${content}!next?last https://example.com/a!b?q=x user@example.com Keep!this?here`;
    const output = `${content}! next? last https://example.com/a!b?q=x user@example.com Keep!this?here`;

    expect(service.format(input)).toBe(output);
    expect(service.format(output)).toBe(output);
    expect(service.format('word !next ?last')).toBe('word! next? last');
    expect(new Typographist({ locale, categories: [] }).format(input)).toBe(input);
    expect(new Typographist({ locale, categories: ['hyphenation'] }).format('a!b?c')).toBe('a!b?c');
  });

  it('spaces Russian ellipses using reference letter boundaries', () => {
    const id = 'ru/space/afterHellip';
    const rules = createBundledSpacing('ru').filter((rule) => rule.id === id);
    const format = prepareTextPipeline(rules, 'ru');

    expect(rules).toHaveLength(1);
    expect(format('слово...Далее слово…Ёж Что?..next Да!..Слово')).toBe(
      'слово... Далее слово… Ёж Что?.. next Да!.. Слово',
    );
    const unchanged = 'Слово...далее A...Б а....Б а…б !...а ?..1 ?..😀 а…\u0301Б а… Б';

    expect(format(unchanged)).toBe(unchanged);
    expect(format('')).toBe('');
    expect(format(' \r\n\t ')).toBe(' \r\n\t ');
    expect(format('а...Б...В')).toBe('а... Б...В');
    expect(format('а... Б...В')).toBe('а... Б...В');
    expect(() => prepareTextPipeline(rules, 'ru', { settings: { [id]: { unknown: true } } })).toThrow(
      'Invalid setting',
    );
    expect(createBundledSpacing('en').some((rule) => rule.id === id)).toBe(false);
  });

  it.each([false, true])('combines Russian ellipsis spacing and hyphenation with useFast=%s', (useFast) => {
    const service = new Typographist({
      locale: 'ru',
      useFast,
      categories: ['spacing', 'punctuation', 'hyphenation'],
      protectedContent: ['Keep?..this'],
    });
    const legacy = new Typographist({ locale: 'ru', useFast, categories: ['hyphenation'] });
    const content = '$100 100 руб. 12345 1.25 1/2 2026-10-08 +7-999-123-45-67 word word MiXeD мiкс';
    const input = `${content} слово...Далее Что?..next https://example.com/a?..b user@example.com Keep?..this`;
    const normalized = `${content} слово… Далее Что?.. next https://example.com/a?..b user@example.com Keep?..this`;
    const output = legacy.format(normalized);

    expect(service.format(input)).toBe(output);
    expect(service.format(output)).toBe(output);
    expect(new Typographist({ locale: 'ru', categories: [] }).format(input)).toBe(input);
    expect(legacy.format('я...Я')).toBe('я...Я');
    expect(new Typographist({ locale: 'ru', categories: ['punctuation'] }).format('я...Я')).toBe('я…Я');
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
