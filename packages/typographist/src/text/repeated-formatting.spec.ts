import { Typographist } from '@/index.js';

describe.each(['en', 'ru'] as const)('repeated formatting for %s', (locale) => {
  describe.each([false, true])('with useFast=%s', (useFast) => {
    describe.each([0, 64])('with cacheSize=%s', (cacheSize) => {
      it.each([
        '',
        ' \t\r\n ',
        '  "table"  ...  ',
        '  «слово»  ...  ',
        '😀 é MiXeD мiкс',
        'https://example.com/a-b user-name@example.com',
        '$100 1.25 1/2 2026-10-08',
      ])('keeps the normalized default output stable for %j', (input) => {
        const service = new Typographist({ locale, useFast, cacheSize });
        const once = service.format(input);

        expect(service.format(once)).toBe(once);
        expect(service.format(input)).toBe(once);
      });

      it('preserves protected content on successive default passes', () => {
        const protectedText = '  "table"...  ';
        const service = new Typographist({ locale, useFast, cacheSize, protectedContent: [protectedText] });
        const once = service.format(`😀 ${protectedText} 😀`);

        expect(once).toContain(protectedText);
        expect(service.format(once)).toBe(once);
      });

      it('keeps the hyphenation-only output stable', () => {
        const service = new Typographist({ locale, useFast, cacheSize, categories: ['hyphenation'] });
        const input = 'Typography типографика table\u00adtable é https://example.com user@example.com';
        const once = service.format(input);

        expect(service.format(once)).toBe(once);
        expect(service.format(input)).toBe(once);
      });
    });
  });
});

describe.each([false, true])('default day–month interaction with useFast=%s', (useFast) => {
  it.each([0, 64])('preserves the existing binding on a second pass with cacheSize=%s', (cacheSize) => {
    const service = new Typographist({ locale: 'ru', useFast, cacheSize });
    const hyphenation = new Typographist({ locale: 'ru', useFast, cacheSize, categories: ['hyphenation'] });
    const once = service.format('1-3 января');
    const twice = service.format(once);

    expect(once).toBe(hyphenation.format('1–3\u00a0января'));
    expect(twice).toBe(once);
    expect(service.format(twice)).toBe(twice);
    expect(service.format('1-3 января')).toBe(once);
  });
});
