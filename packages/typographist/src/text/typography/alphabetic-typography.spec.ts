import { Typographist } from '#src/typographist/typographist.js';

describe('bundled alphabetic symbolic typography', () => {
  it.each([
    ['es', '«Hola “mundo” otra vez» — sí 1–3 (−12)'],
    ['fr', '«\u202fHola ‹\u202fmundo\u202f› otra vez\u202f» — sí 1–3 (−12)'],
    ['de', '„Hola ‚mundo‘ otra vez“ – sí 1–3 (−12)'],
    ['pt', '“Hola ‘mundo’ otra vez” — sí 1–3 (−12)'],
    ['it', '«Hola “mundo” otra vez» — sí 1–3 (−12)'],
  ])('formats quotes, prose dashes and integer ranges for %s', (locale, expected) => {
    const service = new Typographist<string>({
      locale,
      categories: ['quotes', 'dashes', 'punctuation', 'nonbreakingSpacing'],
    });

    expect(service.format('"Hola "mundo" otra vez" -- sí 1-3 (-12)')).toBe(expected);
    expect(service.format(expected)).toBe(expected);
  });

  it.each(['es', 'fr', 'de', 'pt', 'it'])('preserves boundaries and content for %s', (locale) => {
    const service = new Typographist<string>({
      locale,
      categories: ['quotes', 'dashes', 'punctuation', 'nonbreakingSpacing'],
      protectedContent: ['"literal" 1-3', '2'],
    });
    const source = '"literal" 1-3 https://example.com/1-3 a-b@example.com 1-2 2-3';

    expect(service.format(source)).toBe(source);
    expect(service.format('2026-10-08 1.2-3.4 +7-999-123 a1-3 1-3b\r\nword  word\t!')).toBe(
      '2026-10-08 1.2-3.4 +7-999-123 a1-3 1-3b\r\nword  word\t!',
    );
    expect(service.format("l'été d'acqua só'água")).toBe('l’été d’acqua só’água');
    expect(new Typographist<string>({ locale, categories: [] }).format('"literal" 1-3')).toBe('"literal" 1-3');
  });

  it('binds existing French punctuation spaces without cleaning whitespace', () => {
    const service = new Typographist<string>({ locale: 'fr', categories: ['nonbreakingSpacing'] });
    const expected = 'Bonjour\u202f! Oui\u202f? Voilà\u00a0: bien\u202f; fin. Non! deux  !\t!\r\n!';

    expect(service.format('Bonjour ! Oui ? Voilà : bien ; fin. Non! deux  !\t!\r\n!')).toBe(expected);
    expect(service.format(expected)).toBe(expected);
  });

  it.each(['es', 'fr', 'de', 'pt', 'it'])(
    'retains locale-owned quotation settings and protected nesting for %s',
    (locale) => {
      const service = new Typographist<string>({
        locale,
        categories: ['quotes'],
        settings: { [`${locale}/punctuation/quote`]: { left: '«', right: '»', spacing: false } },
        protectedContent: ['https://example.com'],
      });

      const expected = '«visita https://example.com ahora»';

      expect(service.format('"visita https://example.com ahora"')).toBe(expected);
      expect(service.format(expected)).toBe(expected);
    },
  );

  it.each(['es', 'fr', 'de', 'pt', 'it'])('recognizes decomposed accented apostrophes for %s', (locale) => {
    const service = new Typographist<string>({ locale, categories: ['punctuation'] });

    expect(service.format("e\u0301'acqua")).toBe('e\u0301’acqua');
  });
});
