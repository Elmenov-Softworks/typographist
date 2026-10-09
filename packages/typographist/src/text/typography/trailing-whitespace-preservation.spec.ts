import { Typographist } from '@/index.js';

describe.each(['en', 'ru'] as const)('trailing-whitespace preservation for %s', (locale) => {
  describe.each([false, true])('useFast=%s', (useFast) => {
    describe.each([0, 1])('cacheSize=%s', (cacheSize) => {
      it.each(['cat \n', 'cat\t\n', 'cat \r', 'cat \r\n', 'cat\u00a0\n', 'cat \n\n'])('preserves %j', (input) => {
        const service = new Typographist({ locale, useFast, cacheSize });

        expect(service.format(input)).toBe(input);
        expect(service.format(service.format(input))).toBe(input);
      });

      it('preserves trailing whitespace around protected fragments before hyphenation', () => {
        const configuration = { locale, useFast, cacheSize, protectedContent: ['keep \nthis'] };
        const service = new Typographist({ ...configuration, categories: ['spacing', 'hyphenation'] });
        const legacy = new Typographist({ ...configuration, categories: ['hyphenation'] });
        const input = 'Typography \nhttps://example.com/a\t\nuser@example.com \r\nkeep \nthis \n';
        const expected = legacy.format(input);

        expect(service.format(input)).toBe(expected);
        expect(service.format(expected)).toBe(expected);
      });
    });
  });

  it.each([{}, { enabled: true }])('rejects removed settings %j', (settings) => {
    expect(() => new Typographist({ locale, settings: { 'common/space/delTrailingBlanks': settings } })).toThrow(
      TypeError,
    );
  });
});
