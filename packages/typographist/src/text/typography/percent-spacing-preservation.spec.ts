import { Typographist } from '@/index.js';

describe.each(['en', 'ru'] as const)('percent spacing preservation for %s', (locale) => {
  describe.each([false, true])('useFast=%s', (useFast) => {
    describe.each([0, 1])('cacheSize=%s', (cacheSize) => {
      it.each(['10 %', '10\u00a0%', '10  ‰', '10\t‱', '10\r\n%', '10\n ‰'])('preserves %j', (input) => {
        const service = new Typographist({ locale, useFast, cacheSize });

        expect(service.format(input)).toBe(input);
        expect(service.format(service.format(input))).toBe(input);
      });

      it('preserves percent spacing with protected content and hyphenation', () => {
        const configuration = { locale, useFast, cacheSize, protectedContent: ['keep 10 %'] };
        const service = new Typographist({ ...configuration, categories: ['spacing', 'hyphenation'] });
        const legacy = new Typographist({ ...configuration, categories: ['hyphenation'] });
        const input = 'Typography 10 % 20\u00a0‰ 30\t‱\r\nkeep 10 % https://example.com/10% user@example.com';
        const expected = legacy.format(input);

        expect(service.format(input)).toBe(expected);
        expect(service.format(expected)).toBe(expected);
      });
    });
  });

  it.each([{}, { enabled: true }])('rejects removed settings %j', (settings) => {
    expect(() => new Typographist({ locale, settings: { 'common/space/delBeforePercent': settings } })).toThrow(
      TypeError,
    );
  });
});
