import { Typographist } from '@/index.js';

describe.each(['en', 'ru'] as const)('repeated-space preservation for %s', (locale) => {
  describe.each([false, true])('useFast=%s', (useFast) => {
    describe.each([0, 1])('cacheSize=%s', (cacheSize) => {
      it.each(['cat  dog', 'cat   dog', 'cat\t\tdog', 'cat \t dog', 'cat\u00a0\u00a0dog'])('preserves %j', (input) => {
        const service = new Typographist({ locale, useFast, cacheSize });

        expect(service.format(input)).toBe(input);
        expect(service.format(service.format(input))).toBe(input);
      });

      it('preserves gaps around protected fragments before hyphenation', () => {
        const configuration = { locale, useFast, cacheSize, protectedContent: ['keep  this'] };
        const service = new Typographist({ ...configuration, categories: ['spacing', 'hyphenation'] });
        const legacy = new Typographist({ ...configuration, categories: ['hyphenation'] });
        const input = 'Typography  works\t\twell  https://example.com/a  user@example.com  keep  this';
        const expected = legacy.format(input);

        expect(service.format(input)).toBe(expected);
        expect(service.format(expected)).toBe(expected);
      });
    });
  });

  it.each([{}, { enabled: true }])('rejects removed settings %j', (settings) => {
    expect(() => new Typographist({ locale, settings: { 'common/space/delRepeatSpace': settings } })).toThrow(
      TypeError,
    );
  });
});
