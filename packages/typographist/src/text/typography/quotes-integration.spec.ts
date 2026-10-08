import { Typographist } from '@/index.js';

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

describe('duplicate quotation removal', () => {
  it.each([
    ['""word""', '«word»'],
    ['"""word"""', '««word»»'],
    ['««word» word»', '«word» word»'],
    ['«word «word»»', '«word «word»'],
    ['""😀 é 1.25""', '«😀 é 1.25»'],
  ])('removes nonoverlapping duplicate pairs in %j', (input, expected) => {
    const instance = new Typographist({
      locale: 'ru',
      categories: ['quotes'],
      settings: { 'common/punctuation/quote': { left: '«', right: '»' } },
    });

    expect(instance.format(input)).toBe(expected);
  });

  it('preserves nested pairs and allows disabling the Russian default', () => {
    expect(new Typographist({ locale: 'ru', categories: ['quotes'] }).format('""word""')).toBe('«„word“»');

    const instance = new Typographist({
      locale: 'ru',
      categories: ['quotes'],
      settings: { 'common/punctuation/quote': { left: '««', right: '»»', removeDuplicateQuotes: false } },
    });

    expect(instance.format('""word""')).toBe('««word»»');
  });

  it('is opt-in for English and preserves protected literals', () => {
    const settings = { left: '«', right: '»' };
    const disabled = new Typographist({ categories: ['quotes'], settings: { 'common/punctuation/quote': settings } });
    const enabled = new Typographist({
      categories: ['quotes'],
      protectedContent: ['""Keep""'],
      settings: { 'common/punctuation/quote': { ...settings, removeDuplicateQuotes: true } },
    });

    expect(disabled.format('""word""')).toBe('««word»»');
    expect(enabled.format('""Keep"" ""word""')).toBe('""Keep"" «word»');
  });

  it.each([
    ['""word""', '”word”'],
    ['"""word"""', '””word””'],
    ['"one "two" three"', '”one ”two” three”'],
  ])('distinguishes opening and closing duplicates for identical glyphs in %j', (input, expected) => {
    const instance = new Typographist({
      categories: ['quotes'],
      settings: { 'common/punctuation/quote': { left: '”', right: '”', removeDuplicateQuotes: true } },
    });

    expect(instance.format(input)).toBe(expected);
  });

  it('rejects nonboolean duplicate-removal settings', () => {
    expect(
      () => new Typographist({ settings: { 'common/punctuation/quote': { removeDuplicateQuotes: 'true' } } }),
    ).toThrow(TypeError);
  });
});
