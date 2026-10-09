import { createBundledNonbreakingSpacing } from '@/text/typography/bundled-nonbreaking-spacing.factory.js';
import { prepareTextPipeline } from '@/text/typography/prepare-text-pipeline.util.js';
import { Typographist } from '@/typographist/typographist.js';

describe('Russian number-sign spacing', () => {
  const id = 'ru/nbsp/afterNumberSign';
  const rules = createBundledNonbreakingSpacing('ru').filter((rule) => rule.id === id);
  const format = prepareTextPipeline(rules, 'ru');

  it.each(['', ' ', '\u2009'])('inserts narrow nonbreaking spacing for separator %j', (space) => {
    const text = `№${space}12345, №${space}п/п`;
    const expected = '№\u202f12345, №\u202fп/п';

    expect(format(text)).toBe(expected);
    expect(format(expected)).toBe(expected);
  });

  it.each([
    '',
    ' \r\n\t',
    '№  12',
    '№\t12',
    '№\n12',
    '№\r12',
    '№П/П',
    '№п / п',
    '№word',
    '№\u00a012',
    '№\u00a0п/п',
    '№\u202f12',
    '№−12',
    '№',
  ])('preserves unsupported input %j', (text) => {
    expect(format(text)).toBe(text);
  });

  it('preserves notation, letters and adjacent number signs', () => {
    expect(format('😀 №№12 №1.25 №1/2 №2026-10-08 №123-45 MiXeD мiкс')).toBe(
      '😀 №№\u202f12 №\u202f1.25 №\u202f1/2 №\u202f2026-10-08 №\u202f123-45 MiXeD мiкс',
    );
    expect(rules).toHaveLength(1);
    expect(() => prepareTextPipeline(rules, 'ru', { settings: { [id]: { unknown: true } } })).toThrow(
      'Invalid setting',
    );
    expect(createBundledNonbreakingSpacing('en').some((rule) => rule.id === id)).toBe(false);
    expect(createBundledNonbreakingSpacing('custom')).toEqual([]);
  });

  it('respects categories and protected content', () => {
    const text = '№12';
    const service = new Typographist({ locale: 'ru', categories: ['nonbreakingSpacing'], protectedContent: [text] });

    expect(service.format(`${text} https://example.com/№13 user№14@example.com`)).toBe(
      `${text} https://example.com/№13 user№14@example.com`,
    );
    for (const categories of [[], ['spacing'], ['hyphenation']] as const) {
      expect(new Typographist({ locale: 'ru', categories }).format(text)).toBe(text);
    }
    expect(new Typographist({ locale: 'ru', categories: ['nonbreakingSpacing'] }).format(text)).toBe('№\u202f12');
  });

  it.each([false, true])('combines ordinary spacing and hyphenation with useFast=%s', (useFast) => {
    const service = new Typographist({ locale: 'ru', useFast });
    const legacy = new Typographist({ locale: 'ru', useFast, categories: ['hyphenation'] });
    const expected = legacy.format('№\u202f12345\u00a0примеры');

    expect(service.format('№ 12345 примеры')).toBe(expected);
    expect(service.format(expected)).toBe(expected);
  });
});
