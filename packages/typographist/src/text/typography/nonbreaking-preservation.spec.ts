import { Typographist } from '@/typographist/typographist.js';

describe('retained nonbreaking bindings preserve boundary bytes', () => {
  it.each([false, true].flatMap((useFast) => [0, 64].map((cacheSize) => ({ useFast, cacheSize }))))(
    'preserves whitespace with useFast=$useFast, cacheSize=$cacheSize',
    (configuration) => {
      for (const profile of [{}, { categories: ['nonbreakingSpacing'] }] as const) {
        const service = new Typographist({ ...configuration, locale: 'ru', ...profile });
        const hyphenation = new Typographist({ ...configuration, locale: 'ru', categories: ['hyphenation'] });
        const fixtures = [
          ['мкр.\nЦентр', 'мкр.\nЦентр'],
          ['мк-н\tЮжный', 'мк-н\tЮжный'],
          ['литер\r\nА', 'литер\r\nА'],
          ['д.  34', 'д.\u00a0 34'],
          ['рис.   001', 'рис.\u00a0  001'],
          ['эт.   2', 'эт.\u00a0  2'],
          ['3   этаж', '3\u00a0  этаж'],
          ['ул.   Ленина', 'ул.\u00a0  Ленина'],
          ['слово\u00a0см. текст', 'слово\u00a0см.\u00a0текст'],
          ['12мм\u00a0длина', '12\u00a0мм\u00a0длина'],
          ['Он\u00a0ли\u00a0тут', 'Он\u00a0ли\u00a0тут'],
        ] as const;

        for (const [input, bound] of fixtures) {
          const expected = 'categories' in profile ? bound : hyphenation.format(bound);

          expect(service.format(input)).toBe(expected);
          expect(service.format(expected)).toBe(expected);
        }
      }
    },
  );

  it('leaves configured protected boundaries untouched', () => {
    const text = 'д.  34 рис.   001 слово\u00a0см. текст 12мм\u00a0длина';
    const service = new Typographist({ locale: 'ru', protectedContent: [text] });

    expect(service.format(text)).toBe(text);
  });
});
