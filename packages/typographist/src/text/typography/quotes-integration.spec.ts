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
