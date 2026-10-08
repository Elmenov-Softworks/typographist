import { createBundledDashes } from '@/text/typography/bundled-dashes.factory.js';
import { prepareTextPipeline } from '@/text/typography/prepare-text-pipeline.util.js';
import { Typographist } from '@/typographist/typographist.js';

const id = 'ru/dash/years';
const rules = createBundledDashes('ru').filter((rule) => rule.id === id);
const format = prepareTextPipeline(rules, 'ru');

describe('Russian year-range dashes', () => {
  it.each([
    ['2020-2021 г.', '2020–2021 г.'],
    ['(1990 -- 2000 годы)', '(1990–2000 годы)'],
    ['😀 0001‒0010гг.', '😀 0001–0010гг.'],
    ['2020\u00a0—\u00a02021\u00a0годах', '2020–2021\u00a0годах'],
    ['2020–2021 г.', '2020–2021 г.'],
    ['', ''],
    [' \r\n\t ', ' \r\n\t '],
    ['2021-2020 г. 2020-2020 г.', '2021-2020 г. 2020-2020 г.'],
    ['2020  -  2021 г. 2020−2021 г.', '2020  -  2021 г. 2020−2021 г.'],
    ['2020-2021  г. 2020-2021 Г.', '2020-2021  г. 2020-2021 Г.'],
    ['id2020-2021г 2020-2021гsuffix 12020-2021г', 'id2020-2021г 2020-2021гsuffix 12020-2021г'],
    ['е́2020-2021г _2020-2021г 2020-2021г_foo', 'е́2020-2021г _2020-2021г 2020-2021г_foo'],
    ['2020-2021\nг. 2020-2021\tг.', '2020-2021\nг. 2020-2021\tг.'],
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

    expect(configured('2020-2021 г.')).toBe(`2020${dash}2021 г.`);
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
      expect(new Typographist({ locale: 'ru', categories }).format('2020-2021 г.')).toBe('2020-2021 г.');
    }
    const protectedFormat = prepareTextPipeline(rules, 'ru', { protectedContent: ['2020-2021 г.'] });

    expect(protectedFormat('2020-2021 г. 1990-2000 гг. https://example.com/20-30 user-name@example.com')).toBe(
      '2020-2021 г. 1990–2000 гг. https://example.com/20-30 user-name@example.com',
    );
  });

  it.each([false, true])('combines spacing and hyphenation with useFast=%s', (useFast) => {
    const service = new Typographist({ locale: 'ru', useFast });
    const legacy = new Typographist({ locale: 'ru', useFast, categories: ['hyphenation'] });
    const expected = legacy.format('Типографика 2020–2021\u00a0гг.');

    expect(service.format('Типографика 2020-2021 гг.')).toBe(expected);
    expect(service.format(expected)).toBe(expected);
  });
});
