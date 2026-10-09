import { Typographist } from '@/index.js';

describe.each(['en', 'ru'] as const)('line-ending preservation for %s', (locale) => {
  describe.each([false, true])('useFast=%s', (useFast) => {
    describe.each([0, 1])('cacheSize=%s', (cacheSize) => {
      it.each([
        'cat\rdog',
        'cat\r\ndog',
        'cat\ndog',
        'cat\r\n\r\n\rdog',
        'cat\u2028dog\u2029cat',
        'cat\rKeep\r\nRAW\r\ndog',
      ])('preserves exact line endings in %j', (input) => {
        const instance = new Typographist({ locale, useFast, cacheSize, protectedContent: ['Keep\r\nRAW'] });

        expect(instance.format(input)).toBe(input);
        expect(instance.format(instance.format(input))).toBe(input);
      });
    });
  });

  it.each([{}, { enabled: false }, { enabled: true }])('rejects removed normalization settings %j', (settings) => {
    expect(() => new Typographist({ locale, settings: { 'common/space/normalizeLineEndings': settings } })).toThrow(
      TypeError,
    );
  });
});
