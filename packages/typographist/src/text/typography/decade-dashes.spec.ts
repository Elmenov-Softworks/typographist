import { createBundledDashes } from '@/text/typography/bundled-dashes.factory.js';
import { prepareTextPipeline } from '@/text/typography/prepare-text-pipeline.util.js';
import { Typographist } from '@/typographist/typographist.js';

const id = 'ru/dash/decade';
const rules = createBundledDashes('ru').filter((rule) => rule.id === id);
const format = prepareTextPipeline(rules, 'ru');

describe('Russian decade-range dashes', () => {
  it.each([
    ['1980-1990-е годы', '1980–1990-е годы'],
    ['20--30-е гг.', '20–30-е гг.'],
    ['слова\n1980‒1990-е г. г.', 'слова\n1980–1990-е г. г.'],
    ['😀 20—30-е\u00a0годах', '😀 20–30-е\u00a0годах'],
    ['20–30-е годы 40-50-е годы', '20–30-е годы 40–50-е годы'],
    ['', ''],
    [' \r\n\t ', ' \r\n\t '],
    ['1981-1990-е годы', '1981-1990-е годы'],
    ['1980 - 1990-е годы', '1980 - 1990-е годы'],
    ['(20-30-е годы) 120-130-е годы', '(20-30-е годы) 120-130-е годы'],
    ['20-30-е Годы 20-30-е века 20-30-Е годы', '20-30-е Годы 20-30-е века 20-30-Е годы'],
    [
      '$100 100 руб. 12345 1.25 1/2 2026-10-08 +7-999-123-45-67 word word MiXeD мiкс е́',
      '$100 100 руб. 12345 1.25 1/2 2026-10-08 +7-999-123-45-67 word word MiXeD мiкс е́',
    ],
  ])('formats reference fixture %j', (text, expected) => {
    expect(format(text)).toBe(expected);
    expect(format(expected)).toBe(expected);
  });

  it.each(['-', '--', '‒', '–', '—', '−'])('supports separator %s', (dash) => {
    const configured = prepareTextPipeline(rules, 'ru', { settings: { [id]: { dash } } });

    expect(configured('1980-1990-е годы')).toBe(`1980${dash}1990-е годы`);
  });

  it.each(['', 'word', ' — ', 1, false])('rejects invalid separator %j', (dash) => {
    expect(() => prepareTextPipeline(rules, 'ru', { settings: { [id]: { dash } } })).toThrow();
  });

  it('rejects undeclared settings and supplies only Russian data', () => {
    expect(() => prepareTextPipeline(rules, 'ru', { settings: { [id]: { unknown: true } } })).toThrow(
      'Invalid setting',
    );
    expect(createBundledDashes('en').some((rule) => rule.id === id)).toBe(false);
    expect(createBundledDashes('custom')).toEqual([]);
  });

  it('respects categories and protected content', () => {
    for (const categories of [[], ['spacing'], ['quotes']] as const) {
      expect(new Typographist({ locale: 'ru', categories }).format('1980-1990-е годы')).toBe('1980-1990-е годы');
    }
    const protectedFormat = prepareTextPipeline(rules, 'ru', { protectedContent: ['1980-1990-е годы'] });

    expect(protectedFormat('1980-1990-е годы 20-30-е годы https://example.com/20-30 user-name@example.com')).toBe(
      '1980-1990-е годы 20–30-е годы https://example.com/20-30 user-name@example.com',
    );
  });

  it.each([false, true])('combines spacing and hyphenation with useFast=%s', (useFast) => {
    const service = new Typographist({ locale: 'ru', useFast });
    const legacy = new Typographist({ locale: 'ru', useFast, categories: ['hyphenation'] });
    const expected = legacy.format('Типографика 1980–1990-е годы');

    expect(service.format('Типографика 1980-1990-е  годы')).toBe(expected);
    expect(service.format(expected)).toBe(expected);
  });
});
