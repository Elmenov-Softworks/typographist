import { Typographist } from '@/index.js';

describe.each(['en', 'ru'] as const)('final-newline preservation for %s', (locale) => {
  describe.each([false, true])('useFast=%s', (useFast) => {
    describe.each([0, 1])('cacheSize=%s', (cacheSize) => {
      it.each(['', 'cat', 'cat\rdog', 'cat\r\ndog', 'cat\ndog', 'cat https://example.com/path', 'cat keep\r'])(
        'does not append a newline to %j',
        (input) => {
          const service = new Typographist({ locale, useFast, cacheSize, protectedContent: ['keep\r'] });

          expect(service.format(input)).toBe(input);
          expect(service.format(service.format(input))).toBe(input);
        },
      );
    });
  });

  it.each([{}, { enabled: false }, { enabled: true }])('rejects removed settings %j', (settings) => {
    expect(() => new Typographist({ locale, settings: { 'common/space/insertFinalNewline': settings } })).toThrow(
      TypeError,
    );
  });
});
