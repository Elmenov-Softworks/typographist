import { Typographist } from '#src/index.js';

const sources = [
  '"outer "inner" end"... -- next',
  '«outer https://example.org» и "next"',
  'почта@example.com alice@пример.рф почта@пример.рф',
  'см. a см. b см. c стр. 1 стр. 2 стр. 3',
  '12м дом 13см лес 14мм поле',
  '300dpi 150lpi 72dpi',
  '1 год 2020г. 100руб. текст',
  'А. С. Пушкин, 1 января, 1990-2000 гг.',
  '  "word"\t\r\n\r\nword.... !! ??  ',
  '😀 е\u0308лка soft\u00adhyphen unsupported Ω café',
];

describe.each(['ru', 'en'] as const)('bundled formatting idempotence for %s', (locale) => {
  it.each([false, true])('is stable with useFast=%s and either cache mode', (useFast) => {
    for (const cacheSize of [0, 64]) {
      const instance = new Typographist({ locale, useFast, cacheSize });

      for (const source of sources) {
        const once = instance.format(source);
        expect(instance.format(once), source).toBe(once);
      }
    }
  });

  it('preserves internationalized addresses through both algorithms', () => {
    const source = 'почта@example.com alice@пример.рф почта@пример.рф';

    for (const useFast of [false, true]) {
      expect(new Typographist({ locale, useFast }).format(source)).toBe(source);
    }
  });

  it('is stable with symbolic categories and configured short-word lengths', () => {
    const instance = new Typographist({
      locale,
      categories: ['quotes', 'dashes', 'punctuation', 'nonbreakingSpacing'],
      settings: { 'common/nbsp/afterShortWord': { lengthShortWord: 3 } },
    });

    for (const source of sources) {
      const once = instance.format(source);
      expect(instance.format(once), source).toBe(once);
    }
  });
});
