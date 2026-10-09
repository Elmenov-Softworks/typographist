import { Typographist } from '@/index.js';

describe('range separator whitespace preservation', () => {
  it.each([
    ['1990 --2000 годы', '1990 –2000 годы'],
    ['1990\u00a0-\u00a02000 годы', '1990\u00a0–\u00a02000 годы'],
    ['XV --XVI', 'XV –XVI'],
    ['XV\u00a0-\u00a0XVI', 'XV\u00a0–\u00a0XVI'],
    ['май --июнь', 'май –июнь'],
    ['среда --четверг', 'среда –четверг'],
    ['XV  -XVI', 'XV  -XVI'],
    ['май\t-июнь', 'май\t-июнь'],
  ])('preserves surrounding bytes for %j', (input, expected) => {
    const service = new Typographist({ locale: 'ru', useFast: false, cacheSize: 0, categories: ['dashes'] });
    const prefix = '\t  😀\r\n\r\n';
    const suffix = '  \t\r\n';

    expect(service.format(prefix + input + suffix)).toBe(prefix + expected + suffix);
    expect(service.format(prefix + expected + suffix)).toBe(prefix + expected + suffix);
  });

  it('preserves protected range gaps while formatting adjacent ranges', () => {
    const protectedRange = 'XV --XVI';
    const service = new Typographist({
      locale: 'ru',
      categories: ['dashes'],
      protectedContent: [protectedRange],
    });

    expect(service.format(`${protectedRange}\r\nмай --июнь`)).toBe(`${protectedRange}\r\nмай –июнь`);
  });
});
