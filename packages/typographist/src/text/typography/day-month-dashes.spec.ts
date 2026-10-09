import { createBundledDashes } from '@/text/typography/bundled-dashes.factory.js';
import { prepareTextPipeline } from '@/text/typography/prepare-text-pipeline.util.js';
import { Typographist } from '@/typographist/typographist.js';

const id = 'ru/dash/daysMonth';
const rules = createBundledDashes('ru').filter((rule) => rule.id === id);
const format = prepareTextPipeline(rules, 'ru');

describe('Russian day–month range dashes', () => {
  it.each([
    ['1-3 января', '1–3\u00a0января'],
    ['20--31 декабря', '20–31\u00a0декабря'],
    ['слова\n01‒09 февраля', 'слова\n01‒09 февраля'],
    ['😀 2—4\u00a0марта', '😀 2–4\u00a0марта'],
    ['1–3 апреля 4-6 мая', '1–3\u00a0апреля 4–6\u00a0мая'],
    ['39-0 июняsuffix', '39–0\u00a0июняsuffix'],
    ['', ''],
    [' \r\n\t ', ' \r\n\t '],
    ['40-50 июля 123-124 августа', '40-50 июля 123-124 августа'],
    ['1 - 3 сентября 1-3  октября', '1 - 3 сентября 1-3  октября'],
    ['(1-3 ноября) 1-3 Декабря', '(1-3 ноября) 1-3 Декабря'],
    ['1-3\tянваря 1-3\nфевраля 1−3 марта', '1-3\tянваря 1-3\nфевраля 1−3 марта'],
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

    expect(configured('1-3 января')).toBe(`1${dash}3\u00a0января`);
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
      expect(new Typographist({ locale: 'ru', categories }).format('1-3 января')).toBe('1-3 января');
    }
    const protectedFormat = prepareTextPipeline(rules, 'ru', { protectedContent: ['1-3 января'] });

    expect(protectedFormat('1-3 января 4-6 мая https://example.com/20-30 user-name@example.com')).toBe(
      '1-3 января 4–6\u00a0мая https://example.com/20-30 user-name@example.com',
    );
  });

  it.each([false, true])('combines spacing and hyphenation with useFast=%s', (useFast) => {
    const service = new Typographist({ locale: 'ru', useFast });
    const legacy = new Typographist({ locale: 'ru', useFast, categories: ['hyphenation'] });
    const expected = legacy.format('Типографика 1–3\u00a0января');

    expect(service.format('Типографика 1-3  января')).toBe(expected);
    expect(service.format(expected)).toBe(expected);
  });
});
