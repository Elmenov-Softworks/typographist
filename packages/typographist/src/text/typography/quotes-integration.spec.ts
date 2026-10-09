import { Typographist } from '@/index.js';

describe('quotation pipeline interactions', () => {
  it.each([
    ['en', '"don\'t..."', '“don’t…”'],
    ['ru', '"д\'Артаньян..."', '«д’Артаньян…»'],
    ['en', '"hello" ,world!', '“hello” ,world!'],
    ['ru', '"слово" ,текст!', '«слово» ,текст!'],
    ['ru', '- "Привет!"', '—\u00a0«Привет!»'],
  ] as const)('combines selected symbolic rules for %s: %j', (locale, input, expected) => {
    const instance = new Typographist({
      settings: { 'common/punctuation/quote': { spacing: false } },
      locale,
      categories: ['quotes', 'punctuation', 'spacing', 'dashes'],
    });

    expect(instance.format(input)).toBe(expected);
    expect(instance.format(expected)).toBe(expected);
  });

  it.each(['en', 'ru'] as const)('preserves isolated quotes at protected boundaries in %s', (locale) => {
    const instance = new Typographist({
      settings: { 'common/punctuation/quote': { spacing: false } },
      locale,
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
    const quotes = new Typographist({
      settings: { 'common/punctuation/quote': { spacing: false } },
      categories: ['quotes'],
    });
    const punctuation = new Typographist({
      categories: ['punctuation'],
    });

    expect(quotes.format('"don\'t"')).toBe("“don't”");
    expect(punctuation.format('"don\'t"')).toBe('"don’t"');
  });
});

describe('bundled quotation service integration', () => {
  it.each([
    ['en', '“hello ‘world’ hello”'],
    ['ru', '«hello „world“ hello»'],
  ] as const)('selects %s quotation pairs without hyphenation', (locale, expected) => {
    const instance = new Typographist({
      settings: { 'common/punctuation/quote': { spacing: false } },
      locale,
      categories: ['quotes'],
    });

    expect(instance.format('"hello "world" hello"')).toBe(expected);
    expect(instance.format(expected)).toBe(expected);
  });

  it.each([false, true])('combines default typography and hyphenation with useFast=%s', (useFast) => {
    const instance = new Typographist({ useFast });
    const hyphenation = new Typographist({
      useFast,
      categories: ['hyphenation'],
    });

    expect(instance.format('"banana"...')).toBe(`“\u202f${hyphenation.format('banana')}\u202f”…`);
    expect(hyphenation.format('"banana"')).toBe(`"${hyphenation.format('banana')}"`);
  });

  it('preserves protected content and formats adjacent prose', () => {
    const instance = new Typographist({
      settings: { 'common/punctuation/quote': { spacing: false } },
      categories: ['quotes'],
      protectedContent: ['"Keep"'],
    });

    expect(instance.format('"Keep" "change" https://example.com/a user@example.com')).toBe(
      '"Keep" “change” https://example.com/a user@example.com',
    );

    expect(new Typographist({ categories: [] }).format('"banana"')).toBe('"banana"');
  });

  it('installs quotation data for typography-only bundled locales and replacement', () => {
    const instance = new Typographist({
      settings: { 'common/punctuation/quote': { spacing: false } },
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
      settings: { 'common/punctuation/quote': { spacing: false, left: '‘“', right: '’”' } },
    });

    expect(instance.format('"hello "world" hello"')).toBe('‘hello “world” hello’');
  });

  it('supports one pair and repeated pairs without nesting substitution', () => {
    for (const left of ['«', '««']) {
      const instance = new Typographist({
        categories: ['quotes'],
        settings: { 'common/punctuation/quote': { spacing: false, left, right: '»'.repeat(left.length) } },
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
      settings: { 'common/punctuation/quote': { spacing: false, left: '”’', right: '”’' } },
    });

    expect(instance.format(input)).toBe(expected);
  });

  it('supports one identical pair and preserves literal private-use characters', () => {
    const instance = new Typographist({
      categories: ['quotes'],
      settings: { 'common/punctuation/quote': { spacing: false, left: '”', right: '”' } },
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
    it.each([
      ['""word""', '««word»»'],
      ['"""word"""', '«««word»»»'],
      ['««word» word»', '««word» word»'],
      ['«word «word»»', '«word «word»»'],
      ['""😀 é 1.25""', '««😀 é 1.25»»'],
    ])('preserves every quote in %j', (input, expected) => {
      const instance = new Typographist({
        locale,
        categories: ['quotes'],
        settings: { 'common/punctuation/quote': { spacing: false, left: '«', right: '»' } },
      });

      expect(instance.format(input)).toBe(expected);
      expect(instance.format(expected)).toBe(expected);
    });

    it('preserves protected duplicate quotes and nested pairs', () => {
      const instance = new Typographist({
        settings: { 'common/punctuation/quote': { spacing: false } },
        locale,
        categories: ['quotes'],
        protectedContent: ['""Keep""'],
      });
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
      settings: { 'common/punctuation/quote': { spacing: false, left: '”', right: '”' } },
    });

    expect(instance.format('"""word"""')).toBe('”””word”””');
  });
});

describe('quotation spacing', () => {
  it.each([
    ['"hello"', '«\u202fhello\u202f»'],
    ['« word »', '«\u202fword\u202f»'],
    ['«\u00a0word\u00a0»', '«\u00a0word\u00a0»'],
    ['«\u202fword\u202f»', '«\u202fword\u202f»'],
    ['«  word  »', '«\u202f word \u202f»'],
    ['"one "two" three"', '«\u202fone ‹\u202ftwo\u202f› three\u202f»'],
    ['""word""', '«\u202f‹\u202fword\u202f›\u202f»'],
    ['"open', '«\u202fopen'],
    ['close"', 'close\u202f»'],
    ['"😀 é"', '«\u202f😀 é\u202f»'],
    ['"$100 1.25 1/2 2026-10-08 MiXeD"', '«\u202f$100 1.25 1/2 2026-10-08 MiXeD\u202f»'],
    ['«\tword\t»', '«\tword\t»'],
    ['«\nword\n»', '«\nword\n»'],
    ['', ''],
    ['word', 'word'],
  ])('preserves boundary whitespace for %j', (input, expected) => {
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
    ['« word »', '”\u202fword\u202f”'],
  ])('uses quote direction with identical glyphs for %j', (input, expected) => {
    const instance = new Typographist({
      categories: ['quotes'],
      settings: { 'common/punctuation/quote': { left: '”’', right: '”’', spacing: true } },
    });

    expect(instance.format(input)).toBe(expected);
  });

  it.each(['en', 'ru'] as const)('defaults to boundary spacing for %s and honors category selection', (locale) => {
    const defaults = new Typographist({ locale, categories: ['quotes'] });
    const disabled = new Typographist({
      locale,
      categories: [],
      settings: { 'common/punctuation/quote': { spacing: true } },
    });
    const glyphs = locale === 'ru' ? (['«', '»'] as const) : (['“', '”'] as const);

    expect(defaults.format('"word"')).toBe(`${glyphs[0]}\u202fword\u202f${glyphs[1]}`);
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

describe.each(['en', 'ru'] as const)('default quotation boundary spacing for %s', (locale) => {
  it.each([false, true])('preserves whitespace and signs with spacing disabled=%s', (disabled) => {
    const instance = new Typographist({
      locale,
      protectedContent: ['"Keep"'],
      ...(disabled ? { settings: { 'common/punctuation/quote': { spacing: false } } } : {}),
    });
    const [left, right] = locale === 'ru' ? (['«', '»'] as const) : (['“', '”'] as const);
    const gap = disabled ? '' : '\u202f';
    const nested = locale === 'ru' ? (['„', '“'] as const) : (['‘', '’'] as const);
    const cases = [
      ['""cat""', `${left}${gap}${nested[0]}${gap}cat${gap}${nested[1]}${gap}${right}`],
      ['"cat"', `${left}${gap}cat${gap}${right}`],
      [`${left}   cat   ${right}`, `${left}${disabled ? ' ' : gap}  cat  ${disabled ? ' ' : gap}${right}`],
      [`${left}\tcat\t${right}`, `${left}\tcat\t${right}`],
      [`${left}\rcat\r${right}`, `${left}\rcat\r${right}`],
      [`${left}\r\ncat\r\n${right}`, `${left}\r\ncat\r\n${right}`],
      [`${left}\u00a0cat\u00a0${right}`, `${left}\u00a0cat\u00a0${right}`],
      ['  \t"cat"!!!???  \t\r\n\r\n', `  \t${left}${gap}cat${gap}${right}!!!???  \t\r\n\r\n`],
      ['"Keep" "cat"', `"Keep" ${left}${gap}cat${gap}${right}`],
    ] as const;

    for (const [input, expected] of cases) {
      expect(instance.format(input)).toBe(expected);
      expect(instance.format(expected)).toBe(expected);
    }
  });
});

describe.each(['en', 'ru'] as const)('spaced straight quotation boundaries for %s', (locale) => {
  it.each([false, true])('preserves boundary bytes with spacing=%s', (spacing) => {
    const instance = new Typographist({
      locale,
      categories: ['quotes'],
      settings: { 'common/punctuation/quote': { spacing } },
    });
    const [left, right] = locale === 'ru' ? (['«', '»'] as const) : (['“', '”'] as const);
    const boundary = spacing ? '\u202f' : ' ';
    const cases = [
      ['" cat "', `${left}${boundary}cat${boundary}${right}`],
      ['"   cat   "', `${left}${boundary}  cat  ${boundary}${right}`],
      ['"\tcat\t"', `${left}\tcat\t${right}`],
      ['" \tcat\t "', `${left}${boundary}\tcat\t${boundary}${right}`],
      ['"\u00a0cat\u00a0"', `${left}\u00a0cat\u00a0${right}`],
      ['"\ncat\n"', '"\ncat\n"'],
      ['"\rcat\r"', '"\rcat\r"'],
      ['"\r\ncat\r\n"', '"\r\ncat\r\n"'],
    ] as const;

    for (const [input, expected] of cases) {
      expect(instance.format(input)).toBe(expected);
      expect(instance.format(expected)).toBe(expected);
    }
  });

  it.each([false, true])('spaces existing configured quotation glyphs with spacing=%s', (spacing) => {
    const instance = new Typographist({
      locale,
      categories: ['quotes'],
      settings: { 'common/punctuation/quote': { left: '「', right: '」', spacing } },
    });
    const gap = spacing ? '\u202f' : ' ';
    const cases = [
      ['「 cat 」', `「${gap}cat${gap}」`],
      ['「   cat   」', `「${gap}  cat  ${gap}」`],
      ['「\tcat\t」', '「\tcat\t」'],
      ['「\r\ncat\r\n」', '「\r\ncat\r\n」'],
      ['「\u00a0cat\u00a0」', '「\u00a0cat\u00a0」'],
    ] as const;

    for (const [input, expected] of cases) {
      expect(instance.format(input)).toBe(expected);
      expect(instance.format(expected)).toBe(expected);
    }
  });

  it.each(['|', ']', '\\', '^', '-'])('spaces existing identical custom pair %j', (glyph) => {
    const instance = new Typographist({
      locale,
      categories: ['quotes'],
      settings: { 'common/punctuation/quote': { left: glyph, right: glyph } },
    });
    const cases = [
      [`${glyph}cat${glyph}`, `${glyph}\u202fcat\u202f${glyph}`],
      [`${glyph} cat ${glyph}`, `${glyph}\u202fcat\u202f${glyph}`],
      [`${glyph}   cat   ${glyph}`, `${glyph}\u202f  cat  \u202f${glyph}`],
      [`${glyph}\tcat\t${glyph}`, `${glyph}\tcat\t${glyph}`],
      [`${glyph}\u00a0cat\u00a0${glyph}`, `${glyph}\u00a0cat\u00a0${glyph}`],
      [`${glyph}\r\ncat\r\n${glyph}`, `${glyph}\r\ncat\r\n${glyph}`],
    ] as const;

    for (const [input, expected] of cases) {
      expect(instance.format(input)).toBe(expected);
      expect(instance.format(expected)).toBe(expected);
    }
  });

  it('preserves existing identical custom boundaries with spacing disabled', () => {
    const instance = new Typographist({
      locale,
      categories: ['quotes'],
      settings: { 'common/punctuation/quote': { left: '|', right: '|', spacing: false } },
    });

    for (const input of ['|cat|', '| cat |', '|   cat   |', '|\tcat\t|', '|\r\ncat\r\n|']) {
      expect(instance.format(input)).toBe(input);
    }
  });

  it('spaces existing nested custom pairs inside identical outer glyphs', () => {
    const instance = new Typographist({
      locale,
      categories: ['quotes'],
      settings: { 'common/punctuation/quote': { left: '|「', right: '|」' } },
    });
    const expected = '|\u202fone 「\u202ftwo\u202f」 three\u202f|';

    expect(instance.format('| one 「 two 」 three |')).toBe(expected);
    expect(instance.format(expected)).toBe(expected);
  });
});
