import { Typographist } from '@/index.js';

describe.each(['en', 'ru'] as const)('exclamation and question boundary preservation for %s', (locale) => {
  describe.each([false, true])('useFast=%s', (useFast) => {
    describe.each([0, 1])('cacheSize=%s', (cacheSize) => {
      it.each(['! !', '? ?', '! ? ! ?', '!! !! ?? ??', '!\t! ?\t?', '!\r\n! ?\r?', '!\u00a0! ?\u00a0?'])(
        'preserves %j',
        (input) => {
          const service = new Typographist({ locale, useFast, cacheSize });

          const output = service.format(input);

          expect(output).toBe(input);
          expect(service.format(output)).toBe(output);
        },
      );

      it('preserves repeated signs beside ellipses and protected content', () => {
        const configuration = { locale, useFast, cacheSize, protectedContent: ['Keep ... ! !'] };
        const service = new Typographist(configuration);
        const legacy = new Typographist({ ...configuration, categories: ['hyphenation'] });
        const input = 'Typography ... ! ! ? ?\r\nKeep ... ! ! https://example.com/a!?b user@example.com';
        const expected = legacy.format(input.replace('Typography ...', 'Typography …'));

        expect(service.format(input)).toBe(expected);
        expect(service.format(expected)).toBe(expected);
      });
    });
  });

  it.each([{}, { enabled: true }])('rejects removed settings %j', (settings) => {
    expect(
      () => new Typographist({ locale, settings: { 'common/space/delBetweenExclamationMarks': settings } }),
    ).toThrow(TypeError);
  });
});
