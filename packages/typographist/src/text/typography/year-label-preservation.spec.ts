import { Typographist } from '@/index.js';

describe.each(['en', 'ru'] as const)('year-label boundary preservation for %s', (locale) => {
  describe.each([false, true])('useFast=%s', (useFast) => {
    describe.each([0, 1])('cacheSize=%s', (cacheSize) => {
      it.each(['2027год', '123года', '2026году 2027годом', '2026  год', '2026\tгод', '2026\r\nгод', '2026\u00a0год'])(
        'preserves %j',
        (input) => {
          const service = new Typographist({ locale, useFast, cacheSize });
          const output = service.format(input);

          expect(output.replaceAll('\u00ad', '')).toBe(input);
          expect(service.format(output)).toBe(output);
        },
      );

      it('preserves protected year labels before hyphenation', () => {
        const configuration = { locale, useFast, cacheSize, protectedContent: ['2026год'] };
        const service = new Typographist({ ...configuration, categories: ['spacing', 'hyphenation'] });
        const legacy = new Typographist({ ...configuration, categories: ['hyphenation'] });
        const input = '2027год 2026год 2028\tгод 2029\r\nгод https://example.com/2030год';
        const expected = legacy.format(input);

        expect(service.format(input)).toBe(expected);
        expect(service.format(expected)).toBe(expected);
      });
    });
  });

  it.each([{}, { enabled: true }])('rejects removed settings %j', (settings) => {
    expect(() => new Typographist({ locale, settings: { 'ru/space/year': settings } })).toThrow(TypeError);
  });
});
