import { Typographist } from '@/index.js';

describe.each(['en', 'ru'] as const)('punctuation boundary preservation for %s', (locale) => {
  describe.each([false, true])('useFast=%s', (useFast) => {
    describe.each([0, 1])('cacheSize=%s', (cacheSize) => {
      it.each(['word !', 'word  ?', 'word :', 'word ;', 'word ,', '!  ! ?  ?', 'word\t,', 'word\r\n!', 'word\u00a0?'])(
        'preserves %j',
        (input) => {
          const service = new Typographist({ locale, useFast, cacheSize });

          const output = service.format(input);

          expect(output.replaceAll('\u00ad', '')).toBe(input);
          expect(service.format(output)).toBe(output);
        },
      );

      it('preserves punctuation gaps beside protected content and hyphenated words', () => {
        const configuration = { locale, useFast, cacheSize, protectedContent: ['Keep ... ,'] };
        const service = new Typographist(configuration);
        const legacy = new Typographist({ ...configuration, categories: ['hyphenation'] });
        const input = 'Typography  !  Типографика  ?\r\nKeep ... , https://example.com/a user@example.com';
        const expected = legacy.format(input);

        expect(service.format(input)).toBe(expected);
        expect(service.format(expected)).toBe(expected);
      });
    });
  });

  it.each([{}, { enabled: true }])('rejects removed settings %j', (settings) => {
    expect(() => new Typographist({ locale, settings: { 'common/space/delBeforePunctuation': settings } })).toThrow(
      TypeError,
    );
  });
});
