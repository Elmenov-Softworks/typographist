import { Typographist } from '@/index.js';

describe.each(['en', 'ru'] as const)('outer whitespace preservation for %s', (locale) => {
  describe.each([false, true])('useFast=%s', (useFast) => {
    describe.each([0, 1])('cacheSize=%s', (cacheSize) => {
      it.each(['cat\t', '\u00a0cat\u202f', '\ufeffcat\ufeff', 'KEEP\r\n\t ', '\u00a0\u202f\ufeff'])(
        'preserves untrimmed default boundaries in %j',
        (input) => {
          const service = new Typographist({ locale, useFast, cacheSize, protectedContent: ['KEEP\r\n\t '] });

          expect(service.format(input)).toBe(input);
          expect(service.format(service.format(input))).toBe(input);
        },
      );

      it('preserves full boundaries independently of remaining cleanup', () => {
        const service = new Typographist({
          locale,
          useFast,
          cacheSize,
          categories: ['quotes', 'dashes', 'punctuation', 'nonbreakingSpacing', 'hyphenation'],
        });
        const input = ' \t\r\ncat\r\n\t ';

        expect(service.format(input)).toBe(input);
        expect(service.format(service.format(input))).toBe(input);
      });
    });
  });

  it.each(['common/space/trimLeft', 'common/space/trimRight'])('rejects removed setting %s', (id) => {
    for (const settings of [{}, { enabled: false }, { enabled: true }]) {
      expect(() => new Typographist({ locale, settings: { [id]: settings } })).toThrow(TypeError);
    }
  });
});
