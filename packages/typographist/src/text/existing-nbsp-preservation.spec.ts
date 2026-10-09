import { Typographist } from '@/index.js';

describe.each(['ru', 'en'] as const)('existing NBSP preservation for %s', (locale) => {
  describe.each([false, true])('with useFast=%s', (useFast) => {
    describe.each([0, 64])('with cacheSize=%s', (cacheSize) => {
      it.each(['😀\u00a0\u00a0😀', '12345\u00a01.25\u00a01/2'])(
        'preserves existing NBSPs in the default profile for %j',
        (input) => {
          const service = new Typographist({ locale, useFast, cacheSize });

          expect(service.format(input)).toBe(input);
          expect(service.format(service.format(input))).toBe(input);
        },
      );

      it('preserves NBSPs and adjacent whitespace with only nonbreaking bindings selected', () => {
        const service = new Typographist({ locale, useFast, cacheSize, categories: ['nonbreakingSpacing'] });
        const input = '\t😀\u00a0  😀\r\n\u00a0\u00a0\t\n';

        expect(service.format(input)).toBe(input);
        expect(service.format(service.format(input))).toBe(input);
      });

      it('preserves protected NBSPs while applying retained bindings', () => {
        const service = new Typographist({
          locale,
          useFast,
          cacheSize,
          categories: ['nonbreakingSpacing'],
          protectedContent: ['kept\u00a0  literal'],
        });

        expect(service.format('kept\u00a0  literal § 12')).toBe(
          `kept\u00a0  literal §${locale === 'ru' ? '\u202f' : '\u00a0'}12`,
        );
      });
    });
  });

  it.each([{}, { unknown: true }])('rejects removed builtin settings %j', (settings) => {
    expect(() => new Typographist({ locale, settings: { 'common/nbsp/replaceNbsp': settings } })).toThrow(
      'Unknown text rule: common/nbsp/replaceNbsp',
    );
  });
});
