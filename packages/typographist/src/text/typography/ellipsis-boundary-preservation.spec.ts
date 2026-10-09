import { Typographist } from '@/index.js';

describe.each(['en', 'ru'] as const)('ellipsis boundary preservation for %s', (locale) => {
  describe.each([false, true])('useFast=%s', (useFast) => {
    describe.each([0, 1])('cacheSize=%s', (cacheSize) => {
      it.each([
        'слово…Далее',
        'Что?..next',
        'Да!..Слово',
        'слово…  Далее',
        'слово…\tДалее',
        'слово…\r\nДалее',
        'слово…\u00a0Далее',
      ])('preserves %j', (input) => {
        const service = new Typographist({ locale, useFast, cacheSize });
        const output = service.format(input);

        expect(output.replaceAll('\u00ad', '')).toBe(input);
        expect(service.format(output)).toBe(output);
      });

      it('converts the ellipsis glyph without inserting a boundary gap', () => {
        const configuration = { locale, useFast, cacheSize, protectedContent: ['Keep?..this'] };
        const service = new Typographist({ ...configuration, categories: ['punctuation', 'hyphenation'] });
        const legacy = new Typographist({ ...configuration, categories: ['hyphenation'] });
        const input = 'слово...Далее Что?..next Keep?..this https://example.com/a?..b';
        const expected = legacy.format(input.replace('...', '…'));

        expect(service.format(input)).toBe(expected);
        expect(service.format(expected)).toBe(expected);
      });
    });
  });

  it.each([{}, { enabled: true }])('rejects removed settings %j', (settings) => {
    expect(() => new Typographist({ locale, settings: { 'ru/space/afterHellip': settings } })).toThrow(TypeError);
  });
});
