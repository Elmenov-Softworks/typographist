import { Typographist } from '@/index.js';

describe('quotation pipeline interactions', () => {
  describe.each([false, true])('useFast=%s', (useFast) => {
    describe.each([0, 1])('cacheSize=%s', (cacheSize) => {
      it.each([
        ['en', '"don\'t..."', '“don’t…”'],
        ['ru', '"д\'Артаньян..."', '«д’Артаньян…»'],
        ['en', '"hello" ,world!', '“hello”, world!'],
        ['ru', '"слово" ,текст!', '«слово», текст!'],
        ['ru', '- "Привет!"', '—\u00a0«Привет!»'],
      ] as const)('combines selected symbolic rules for %s: %j', (locale, input, expected) => {
        const instance = new Typographist({
          locale,
          useFast,
          cacheSize,
          categories: ['quotes', 'punctuation', 'spacing', 'dashes'],
        });

        expect(instance.format(input)).toBe(expected);
        expect(instance.format(expected)).toBe(expected);
      });

      it.each(['en', 'ru'] as const)('preserves isolated quotes at protected boundaries in %s', (locale) => {
        const instance = new Typographist({
          locale,
          useFast,
          cacheSize,
          protectedContent: ['Keep "RAW"'],
          categories: ['quotes', 'punctuation', 'spacing'],
        });
        const [left, right] = locale === 'ru' ? (['«', '»'] as const) : (['“', '”'] as const);
        const input = '"https://example.com/a-b?q=1.25" "user@example.com" "Keep "RAW""';
        const expected = `${input} ${left}change${right}`;

        expect(instance.format(`${input} "change"`)).toBe(expected);
        expect(instance.format(expected)).toBe(expected);
      });

      it('keeps apostrophe conversion independent of quotation selection', () => {
        const quotes = new Typographist({ useFast, cacheSize, categories: ['quotes'] });
        const punctuation = new Typographist({ useFast, cacheSize, categories: ['punctuation'] });

        expect(quotes.format('"don\'t"')).toBe("“don't”");
        expect(punctuation.format('"don\'t"')).toBe('"don’t"');
      });
    });
  });
});

describe('bundled quotation service integration', () => {
  it.each([
    ['en', '“hello ‘world’ hello”'],
    ['ru', '«hello „world“ hello»'],
  ] as const)('selects %s quotation pairs without hyphenation', (locale, expected) => {
    const instance = new Typographist({ locale, categories: ['quotes'] });

    expect(instance.format('"hello "world" hello"')).toBe(expected);
    expect(instance.format(expected)).toBe(expected);
  });

  it.each([false, true])('combines default typography and hyphenation with useFast=%s', (useFast) => {
    const instance = new Typographist({ useFast });
    const hyphenation = new Typographist({ useFast, categories: ['hyphenation'] });

    expect(instance.format('"banana"...')).toBe(`“${hyphenation.format('banana')}”…`);
    expect(hyphenation.format('"banana"')).toBe(`"${hyphenation.format('banana')}"`);
  });

  it('preserves protected content and formats adjacent prose', () => {
    const instance = new Typographist({ categories: ['quotes'], protectedContent: ['"Keep"'] });

    expect(instance.format('"Keep" "change" https://example.com/a user@example.com')).toBe(
      '"Keep" “change” https://example.com/a user@example.com',
    );
    expect(new Typographist({ categories: [] }).format('"banana"')).toBe('"banana"');
  });

  it('installs quotation data for typography-only bundled locales and replacement', () => {
    const instance = new Typographist({
      rules: [],
      categories: ['quotes'],
      textLocales: [{ locale: 'en', textRules: [] }],
    });

    expect(instance.format('"hello"')).toBe('“hello”');

    instance.addTextLocale({ locale: 'en', textRules: [] });

    expect(instance.format('"hello"')).toBe('“hello”');
  });

  it('does not supply quotation data to consumer locales', () => {
    const instance = new Typographist({
      locale: 'custom',
      rules: [],
      textLocales: [{ locale: 'custom', textRules: [] }],
    });

    expect(instance.format('"hello"')).toBe('"hello"');
  });
});

describe('quotation pair settings', () => {
  it('selects British English pairs through the existing English locale', () => {
    const instance = new Typographist({
      categories: ['quotes'],
      settings: { 'common/punctuation/quote': { left: '‘“', right: '’”' } },
    });

    expect(instance.format('"hello "world" hello"')).toBe('‘hello “world” hello’');
  });

  it('supports one pair and repeated pairs without nesting substitution', () => {
    for (const left of ['«', '««']) {
      const instance = new Typographist({
        categories: ['quotes'],
        settings: { 'common/punctuation/quote': { left, right: '»'.repeat(left.length) } },
      });

      expect(instance.format('"hello "world" hello"')).toBe('«hello «world» hello»');
    }
  });

  it.each([
    ['"hello"', '”hello”'],
    ['"one "two" three"', '”one ’two’ three”'],
    ['"one "two "three" two" one"', '”one ’two ’three’ two” one”'],
    ['"open', '”open'],
    ['close"', 'close”'],
    ['"😀 é "inner" text"', '”😀 é ’inner’ text”'],
  ])('supports identical outer glyphs for %j', (input, expected) => {
    const instance = new Typographist({
      categories: ['quotes'],
      settings: { 'common/punctuation/quote': { left: '”’', right: '”’' } },
    });

    expect(instance.format(input)).toBe(expected);
  });

  it('supports one identical pair and preserves literal private-use characters', () => {
    const instance = new Typographist({
      categories: ['quotes'],
      settings: { 'common/punctuation/quote': { left: '”', right: '”' } },
    });

    expect(instance.format('"one "two" three" \uf005\uf008')).toBe('”one ”two” three” \uf005\uf008');
  });

  it.each([
    { left: '', right: '' },
    { left: '«', right: '»”' },
    { left: '««««', right: '»»»»' },
    { left: 'a', right: 'b' },
    { left: '1', right: '2' },
    { left: ' ', right: ' ' },
    { left: '\ud800', right: '»' },
  ])('rejects invalid quotation pairs %j', (settings) => {
    expect(
      () => new Typographist({ categories: ['quotes'], settings: { 'common/punctuation/quote': settings } }),
    ).toThrow(TypeError);
  });
});

describe('quotation multiplicity preservation', () => {
  describe.each(['en', 'ru'] as const)('locale=%s', (locale) => {
    describe.each([false, true])('useFast=%s', (useFast) => {
      describe.each([0, 1])('cacheSize=%s', (cacheSize) => {
        it.each([
          ['""word""', '««word»»'],
          ['"""word"""', '«««word»»»'],
          ['««word» word»', '««word» word»'],
          ['«word «word»»', '«word «word»»'],
          ['""😀 é 1.25""', '««😀 é 1.25»»'],
        ])('preserves every quote in %j', (input, expected) => {
          const instance = new Typographist({
            locale,
            useFast,
            cacheSize,
            categories: ['quotes'],
            settings: { 'common/punctuation/quote': { left: '«', right: '»' } },
          });

          expect(instance.format(input)).toBe(expected);
          expect(instance.format(expected)).toBe(expected);
        });
      });
    });

    it('preserves protected duplicate quotes and nested pairs', () => {
      const instance = new Typographist({ locale, categories: ['quotes'], protectedContent: ['""Keep""'] });
      const expected = locale === 'ru' ? '«„word“»' : '“‘word’”';

      expect(instance.format('""Keep"" ""word""')).toBe(`""Keep"" ${expected}`);
    });

    it.each([true, false, 'true'])('rejects the removed duplicate-removal setting %j', (value) => {
      expect(
        () =>
          new Typographist({
            locale,
            settings: { 'common/punctuation/quote': { removeDuplicateQuotes: value } },
          }),
      ).toThrow(TypeError);
    });
  });

  it('preserves duplicates with identical outer glyphs', () => {
    const instance = new Typographist({
      categories: ['quotes'],
      settings: { 'common/punctuation/quote': { left: '”', right: '”' } },
    });

    expect(instance.format('"""word"""')).toBe('”””word”””');
  });
});

describe('quotation spacing', () => {
  it.each([
    ['"hello"', '«\u202fhello\u202f»'],
    ['« word »', '«\u202fword\u202f»'],
    ['«\u00a0word\u00a0»', '«\u202fword\u202f»'],
    ['«\u202fword\u202f»', '«\u202fword\u202f»'],
    ['«  word  »', '«\u202f word \u202f»'],
    ['"one "two" three"', '«\u202fone ‹\u202ftwo\u202f› three\u202f»'],
    ['""word""', '«\u202f‹\u202fword\u202f›\u202f»'],
    ['"open', '«\u202fopen'],
    ['close"', 'close\u202f»'],
    ['"😀 é"', '«\u202f😀 é\u202f»'],
    ['"$100 1.25 1/2 2026-10-08 MiXeD"', '«\u202f$100 1.25 1/2 2026-10-08 MiXeD\u202f»'],
    ['«\tword\t»', '«\u202f\tword\t\u202f»'],
    ['«\nword\n»', '«\u202f\nword\n\u202f»'],
    ['', ''],
    ['word', 'word'],
  ])('matches reference spacing for %j', (input, expected) => {
    const instance = new Typographist({
      categories: ['quotes'],
      settings: { 'common/punctuation/quote': { left: '«‹', right: '»›', spacing: true } },
    });

    expect(instance.format(input)).toBe(expected);
  });

  it.each([
    ['"hello"', '”\u202fhello\u202f”'],
    ['"one "two" three"', '”\u202fone ’\u202ftwo\u202f’ three\u202f”'],
    ['""word""', '”\u202f’\u202fword\u202f’\u202f”'],
    ['"😀 é"', '”\u202f😀 é\u202f”'],
    ['« word »', '« word »'],
  ])('uses quote direction with identical glyphs for %j', (input, expected) => {
    const instance = new Typographist({
      categories: ['quotes'],
      settings: { 'common/punctuation/quote': { left: '”’', right: '”’', spacing: true } },
    });

    expect(instance.format(input)).toBe(expected);
  });

  it.each(['en', 'ru'] as const)('defaults to no spacing for %s and honors category selection', (locale) => {
    const defaults = new Typographist({ locale, categories: ['quotes'] });
    const disabled = new Typographist({
      locale,
      categories: [],
      settings: { 'common/punctuation/quote': { spacing: true } },
    });
    const glyphs = locale === 'ru' ? (['«', '»'] as const) : (['“', '”'] as const);

    expect(defaults.format('"word"')).toBe(`${glyphs[0]}word${glyphs[1]}`);
    expect(disabled.format('"word"')).toBe('"word"');
  });

  it('preserves protected quotes, addresses and private-use characters', () => {
    const instance = new Typographist({
      categories: ['quotes'],
      protectedContent: ['« Keep »'],
      settings: { 'common/punctuation/quote': { left: '«‹', right: '»›', spacing: true } },
    });

    expect(instance.format('« Keep » "change" https://example.com/a user@example.com \uf005')).toBe(
      '« Keep » «\u202fchange\u202f» https://example.com/a user@example.com \uf005',
    );
  });

  it('keeps ordinary spaced pairs stable on a second pass', () => {
    const instance = new Typographist({
      categories: ['quotes'],
      settings: { 'common/punctuation/quote': { left: '«‹', right: '»›', spacing: true } },
    });
    const formatted = instance.format('"one "two" three"');

    expect(instance.format(formatted)).toBe(formatted);
  });

  it('rejects a nonboolean spacing setting', () => {
    expect(() => new Typographist({ settings: { 'common/punctuation/quote': { spacing: 'true' } } })).toThrow(
      TypeError,
    );
  });
});
