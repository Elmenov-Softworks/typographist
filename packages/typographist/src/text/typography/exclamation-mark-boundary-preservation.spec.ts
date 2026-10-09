import { Typographist } from '@/index.js';

describe.each(['en', 'ru'] as const)('exclamation-mark boundary preservation for %s', (locale) => {
  describe.each([false, true])('useFast=%s', (useFast) => {
    describe.each([0, 1])('cacheSize=%s', (cacheSize) => {
      it.each([
        'word!next',
        'слово!далее',
        'word!!next',
        'word!  next',
        'word!\tnext',
        'word!\r\nnext',
        'word!\u00a0next',
      ])('preserves %j', (input) => {
        const service = new Typographist({ locale, useFast, cacheSize });
        const output = service.format(input);

        expect(output.replaceAll('\u00ad', '')).toBe(input);
        expect(service.format(output)).toBe(output);
      });

      it('preserves protected exclamation marks and unchanged punctuation before hyphenation', () => {
        const configuration = { locale, useFast, cacheSize, protectedContent: ['Keep!this'] };
        const service = new Typographist({ ...configuration, categories: ['spacing', 'punctuation', 'hyphenation'] });
        const legacy = new Typographist({ ...configuration, categories: ['hyphenation'] });
        const input = 'Typography!next!!last!  end!\tword!\r\nline!\u00a0next Keep!this https://example.com/a!b';
        const expected = legacy.format(input);

        expect(service.format(input)).toBe(expected);
        expect(service.format(expected)).toBe(expected);
      });
    });
  });

  it.each([{}, { enabled: true }])('rejects removed settings %j', (settings) => {
    expect(() => new Typographist({ locale, settings: { 'common/space/afterExclamationMark': settings } })).toThrow(
      TypeError,
    );
  });
});
