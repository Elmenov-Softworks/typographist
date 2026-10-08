import { createBundledDashes } from '@/text/typography/bundled-dashes.factory.js';
import { prepareTextPipeline } from '@/text/typography/prepare-text-pipeline.util.js';
import { Typographist } from '@/typographist/typographist.js';

const id = 'ru/dash/time';
const rules = createBundledDashes('ru').filter((rule) => rule.id === id);
const format = prepareTextPipeline(rules, 'ru');

describe('Russian time-range dashes', () => {
  it.each([
    ['9:00-18:30', '9:00–18:30'],
    ['слова\n09:00--18:30!', 'слова\n09:00–18:30!'],
    ['😀 1:05‒99:59, 2:00—3:00', '😀 1:05–99:59, 2:00–3:00'],
    ['9:00–18:30', '9:00–18:30'],
    ['', ''],
    [' \r\n\t ', ' \r\n\t '],
    ['9:60-18:30 100:00-18:30', '9:60-18:30 100:00-18:30'],
    ['9:00 - 18:30 9:00−18:30', '9:00 - 18:30 9:00−18:30'],
    ['(9:00-18:30) 9:00-18:30suffix', '(9:00-18:30) 9:00-18:30suffix'],
    ['\t9:00-18:30 \u00a09:00-18:30', '\t9:00-18:30 \u00a09:00-18:30'],
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

    expect(configured('9:00-18:30')).toBe(`9:00${dash}18:30`);
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
      expect(new Typographist({ locale: 'ru', categories }).format('9:00-18:30')).toBe('9:00-18:30');
    }
    const protectedFormat = prepareTextPipeline(rules, 'ru', { protectedContent: ['9:00-18:30'] });

    expect(protectedFormat('9:00-18:30 1:00-2:00 https://example.com/20-30 user-name@example.com')).toBe(
      '9:00-18:30 1:00–2:00 https://example.com/20-30 user-name@example.com',
    );
  });

  it.each([false, true])('combines spacing and hyphenation with useFast=%s', (useFast) => {
    const service = new Typographist({ locale: 'ru', useFast });
    const legacy = new Typographist({ locale: 'ru', useFast, categories: ['hyphenation'] });
    const expected = legacy.format('Типографика 9:00–18:30');

    expect(service.format('Типографика 9:00-18:30')).toBe(expected);
    expect(service.format(expected)).toBe(expected);
  });
});
