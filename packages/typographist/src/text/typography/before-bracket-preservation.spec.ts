import { Typographist } from '@/index.js';

describe.each(['en', 'ru'] as const)('opening bracket boundary preservation for %s', (locale) => {
  describe.each([false, true])('useFast=%s', (useFast) => {
    describe.each([0, 1])('cacheSize=%s', (cacheSize) => {
      it.each(['word(test)', 'слово(тест)', 'word  (test)', 'word\t(test)', 'word\r\n(test)', 'word\u00a0(test)'])(
        'preserves %j',
        (input) => {
          const service = new Typographist({ locale, useFast, cacheSize });

          const output = service.format(input);

          expect(output.replaceAll('\u00ad', '')).toBe(input);
          expect(service.format(output)).toBe(output);
        },
      );

      it('preserves punctuation boundaries and protected bytes before hyphenation', () => {
        const configuration = { locale, useFast, cacheSize, protectedContent: ['Keep...(this)'] };
        const service = new Typographist({ ...configuration, categories: ['spacing', 'punctuation', 'hyphenation'] });
        const legacy = new Typographist({ ...configuration, categories: ['hyphenation'] });
        const input = 'Typography(test) .(x) ! (x) ? (x) ,(x) ; (x) ...(x) )(x) Keep...(this)';
        const expected = legacy.format(input.replace(' ...(x)', ' …(x)'));

        expect(service.format(input)).toBe(expected);
        expect(service.format(expected)).toBe(expected);
      });
    });
  });

  it.each([{}, { enabled: true }])('rejects removed settings %j', (settings) => {
    expect(() => new Typographist({ locale, settings: { 'common/space/beforeBracket': settings } })).toThrow(TypeError);
  });
});
