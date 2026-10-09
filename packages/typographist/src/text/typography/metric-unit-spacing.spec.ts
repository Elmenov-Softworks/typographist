import { createBundledNonbreakingSpacing } from '@/text/typography/bundled-nonbreaking-spacing.factory.js';
import { prepareTextPipeline } from '@/text/typography/prepare-text-pipeline.util.js';
import { Typographist } from '@/typographist/typographist.js';

describe('Russian metric-unit spacing', () => {
  const id = 'ru/nbsp/m';
  const rules = createBundledNonbreakingSpacing('ru').filter((rule) => rule.id === id);
  const format = prepareTextPipeline(rules, 'ru');

  it.each(['м', 'мм', 'см', 'км', 'дм', 'гм', 'm', 'mm', 'km', 'cm', 'dm'])(
    'preserves unit %s and supplied exponent notation',
    (unit) => {
      for (const exponent of ['', '2', '3', '²', '³']) {
        for (const space of ['', ' ', '\u00a0']) {
          const expected = `123\u00a0${unit}${exponent}`;

          expect(format(`123${space}${unit}${exponent}`)).toBe(expected);
          expect(format(expected)).toBe(expected);
        }
      }
    },
  );

  it.each([
    '',
    ' \r\n\t',
    '12 М2',
    '12 KM',
    '12 hm',
    '12 м4',
    '12 м22',
    '12 метр',
    '12\tм',
    '12  м',
    'word12м',
    '12м:',
    '12м/',
    '$100 100 руб. 12345 1.25 1/2 2026-10-08 +7-999-123-45-67 word word MiXeD мiкс',
  ])('preserves unsupported input %j', (text) => {
    expect(format(text)).toBe(text);
  });

  it('matches reference punctuation boundaries and preserves numeric notation', () => {
    expect(format('😀 (12м2), 1.25cm3!\r\n12мм\u00a0длина')).toBe(
      '😀 (12\u00a0м2), 1.25\u00a0cm3!\r\n12\u00a0мм длина',
    );
    expect(format('12м 13м')).toBe('12\u00a0м 13м');
    expect(format(format('12м 13м'))).toBe('12\u00a0м 13м');
    expect(rules).toHaveLength(1);
    expect(() => prepareTextPipeline(rules, 'ru', { settings: { [id]: { unknown: true } } })).toThrow(
      'Invalid setting',
    );
    expect(createBundledNonbreakingSpacing('en').some((rule) => rule.id === id)).toBe(false);
    expect(createBundledNonbreakingSpacing('custom')).toEqual([]);
  });

  it('respects categories and protected content', () => {
    const text = '12м2';
    const service = new Typographist({ locale: 'ru', categories: ['nonbreakingSpacing'], protectedContent: [text] });

    expect(service.format(`${text} https://example.com/13м2 user14m3@example.com`)).toBe(
      `${text} https://example.com/13м2 user14m3@example.com`,
    );
    for (const categories of [[], ['spacing'], ['hyphenation']] as const) {
      expect(new Typographist({ locale: 'ru', categories }).format(text)).toBe(text);
    }
  });

  it.each([false, true])('combines ordinary spacing and hyphenation with useFast=%s', (useFast) => {
    const service = new Typographist({ locale: 'ru', useFast });
    const legacy = new Typographist({ locale: 'ru', useFast, categories: ['hyphenation'] });
    const expected = legacy.format('12\u00a0м2 примеры');

    expect(service.format('12 м2 примеры')).toBe(expected);
    expect(service.format(expected)).toBe(expected);
  });
});
