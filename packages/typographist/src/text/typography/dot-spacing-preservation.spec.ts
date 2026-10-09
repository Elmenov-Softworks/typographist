import { Typographist } from '@/index.js';

describe.each(['en', 'ru'] as const)('dot spacing preservation for %s', (locale) => {
  describe.each([false, true])('useFast=%s', (useFast) => {
    describe.each([0, 1])('cacheSize=%s', (cacheSize) => {
      it.each(['word .', 'word  .', 'word\t.', 'word\r\n.', 'word\u00a0.', '1 .25'])('preserves %j', (input) => {
        const service = new Typographist({ locale, useFast, cacheSize });

        const output = service.format(input);

        expect(output.replaceAll('\u00ad', '')).toBe(input);
        expect(service.format(output)).toBe(output);
      });

      it('preserves dot spacing around ellipses and protected content', () => {
        const configuration = { locale, useFast, cacheSize, protectedContent: ['keep ...'] };
        const service = new Typographist({ ...configuration, categories: ['spacing', 'punctuation', 'hyphenation'] });
        const legacy = new Typographist({ ...configuration, categories: ['hyphenation'] });
        const input = 'Typography . next ... end\r\nkeep ... https://example.com/a.b user@example.com';
        const expected = legacy.format(input.replace('next ...', 'next …'));

        expect(service.format(input)).toBe(expected);
        expect(service.format(expected)).toBe(expected);
      });
    });
  });

  it.each([{}, { enabled: true }])('rejects removed settings %j', (settings) => {
    expect(() => new Typographist({ locale, settings: { 'common/space/delBeforeDot': settings } })).toThrow(TypeError);
  });
});
