import { Typographist } from '@/index.js';

describe.each(['en', 'ru'] as const)('indentation preservation for %s', (locale) => {
  describe.each([false, true])('useFast=%s', (useFast) => {
    describe.each([0, 1])('cacheSize=%s', (cacheSize) => {
      it.each([
        '  cat',
        '\tcat',
        'cat\n  dog',
        'cat\r\tdog',
        'cat\r\n \tdog',
        'cat\u2028  dog\u2029\tdog',
        ' \t\r\n  \t',
      ])('preserves %j', (input) => {
        const service = new Typographist({ locale, useFast, cacheSize });

        expect(service.format(input)).toBe(input);
        expect(service.format(service.format(input))).toBe(input);
      });

      it('preserves indentation around protected fragments before hyphenation', () => {
        const configuration = { locale, useFast, cacheSize, protectedContent: ['keep  this'] };
        const service = new Typographist({ ...configuration, categories: ['spacing', 'hyphenation'] });
        const legacy = new Typographist({ ...configuration, categories: ['hyphenation'] });
        const input = ' \tTypography\r\n  https://example.com/a\r\tuser@example.com\n  keep  this\n  works';
        const expected = legacy.format(input);

        expect(service.format(input)).toBe(expected);
        expect(service.format(expected)).toBe(expected);
      });
    });
  });

  it.each([{}, { enabled: true }])('rejects removed settings %j', (settings) => {
    expect(() => new Typographist({ locale, settings: { 'common/space/delLeadingBlanks': settings } })).toThrow(
      TypeError,
    );
  });
});
