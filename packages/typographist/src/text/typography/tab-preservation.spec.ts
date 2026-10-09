import { Typographist } from '@/index.js';

describe.each(['en', 'ru'] as const)('tab preservation for %s', (locale) => {
  describe.each([false, true])('useFast=%s', (useFast) => {
    describe.each([0, 1])('cacheSize=%s', (cacheSize) => {
      it.each(['cat\tdog', 'кот\tдом', 'cat\r\ndog\tcat', 'cat\u00a0dog\tcat', 'cat\tKEEP\tcat'])(
        'preserves interior tabs in %j',
        (input) => {
          const service = new Typographist({ locale, useFast, cacheSize, protectedContent: ['KEEP'] });

          expect(service.format(input)).toBe(input);
          expect(service.format(service.format(input))).toBe(input);
        },
      );
    });
  });

  it.each([{}, { enabled: false }, { enabled: true }])('rejects removed settings %j', (settings) => {
    expect(() => new Typographist({ locale, settings: { 'common/space/replaceTab': settings } })).toThrow(TypeError);
  });
});
