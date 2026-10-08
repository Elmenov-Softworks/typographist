import { createBundledNonbreakingSpacing } from '@/text/typography/bundled-nonbreaking-spacing.factory.js';
import { prepareTextPipeline } from '@/text/typography/prepare-text-pipeline.util.js';
import { Typographist } from '@/typographist/typographist.js';

describe('Russian address spacing', () => {
  const id = 'ru/nbsp/addr';
  const rules = createBundledNonbreakingSpacing('ru').filter((rule) => rule.id === id);
  const format = prepareTextPipeline(rules, 'ru');

  it.each([
    ['дом12 д.  34 кв.5 под.6 п-д7', 'дом 12 д. 34 кв. 5 под. 6 п-д 7'],
    ['мкр-н Северный мк-н\tЮжный мкр.\nЦентр мкрн Восток', 'мкр-н Северный мк-н Южный мкр. Центр мкрн Восток'],
    ['эт. -2 3 этаж, литер А', 'эт. -2 3 этаж, литер А'],
    ['УЛ.Ленина обл.  Московская пр-т.Мира оф.12345', 'УЛ. Ленина обл. Московская пр-т. Мира оф. 12345'],
    ['г.Москва, г. Ёлки', 'г. Москва, г. Ёлки'],
    ['3 ЭТАЖ ЛиТеР Б ДоМ12', '3 ЭТАЖ ЛиТеР Б ДоМ 12'],
  ])('formats %j without changing supplied spelling', (text, expected) => {
    expect(format(text)).toBe(expected);
    expect(format(expected)).toBe(expected);
  });

  it.each(['', ' \r\n\t', 'адом12', 'дом\t12', 'эт. −2', '3 этажный', 'литер Ё', 'г. москва', '2026 г.Москва'])(
    'preserves unsupported boundaries %j',
    (text) => {
      expect(format(text)).toBe(text);
    },
  );

  it('preserves numeric notation and Unicode', () => {
    expect(format('😀 дом1.25 кв.1/2 д.2026-10-08 оф.123-45 MiXeD мiкс')).toBe(
      '😀 дом 1.25 кв. 1/2 д. 2026-10-08 оф. 123-45 MiXeD мiкс',
    );
    expect(createBundledNonbreakingSpacing('en').some((rule) => rule.id === id)).toBe(false);
    expect(() => prepareTextPipeline(rules, 'ru', { settings: { [id]: { unknown: true } } })).toThrow(
      'Invalid setting',
    );
  });

  it('respects categories and protected content', () => {
    const text = 'дом12';
    const service = new Typographist({ locale: 'ru', categories: ['nonbreakingSpacing'], protectedContent: [text] });

    expect(service.format(`${text} https://example.com/дом13 дом14@example.com`)).toBe(
      `${text} https://example.com/дом13 дом14@example.com`,
    );
    for (const categories of [[], ['spacing'], ['hyphenation']] as const) {
      expect(new Typographist({ locale: 'ru', categories }).format(text)).toBe(text);
    }
    expect(new Typographist({ locale: 'ru', categories: ['nonbreakingSpacing'] }).format(text)).toBe('дом 12');
  });

  it.each([false, true])('combines spacing and hyphenation with useFast=%s', (useFast) => {
    const service = new Typographist({ locale: 'ru', useFast });
    const legacy = new Typographist({ locale: 'ru', useFast, categories: ['hyphenation'] });
    const expected = legacy.format('УЛ. Московская дом 12');

    expect(service.format('УЛ.  Московская дом12')).toBe(expected);
    expect(service.format(expected)).toBe(expected);
  });
});
