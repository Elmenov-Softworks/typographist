import { Typographist } from '@/index.js';

describe.each(['en', 'ru'] as const)('empty-line preservation for %s', (locale) => {
  describe.each([false, true])('useFast=%s', (useFast) => {
    describe.each([0, 1])('cacheSize=%s', (cacheSize) => {
      it.each(['\n\n\n\n', 'cat\n\n\n\ndog', 'cat\r\n\r\n\r\n\r\ndog', 'cat\r\r\r\rdog', 'cat\r\n\n\r\n\rdog'])(
        'preserves %j with the default profile',
        (input) => {
          const service = new Typographist({ locale, useFast, cacheSize });

          expect(service.format(input)).toBe(input);
          expect(service.format(service.format(input))).toBe(input);
        },
      );

      it('preserves empty lines around protected content before hyphenation', () => {
        const configuration = { locale, useFast, cacheSize, protectedContent: ['keep\n\n\nthis'] };
        const service = new Typographist({ ...configuration, categories: ['spacing', 'hyphenation'] });
        const legacy = new Typographist({ ...configuration, categories: ['hyphenation'] });
        const input = 'Typography\n\n\n\nhttps://example.com/a\n\n\nuser@example.com\n\n\nkeep\n\n\nthis';
        const expected = legacy.format(input);

        expect(service.format(input)).toBe(expected);
        expect(service.format(expected)).toBe(expected);
      });
    });
  });

  it.each([{}, { maxConsecutiveLineBreaks: 1 }, { maxConsecutiveLineBreaks: '2' }])(
    'rejects removed settings %j',
    (settings) => {
      expect(() => new Typographist({ locale, settings: { 'common/space/delRepeatN': settings } })).toThrow(TypeError);
    },
  );
});
