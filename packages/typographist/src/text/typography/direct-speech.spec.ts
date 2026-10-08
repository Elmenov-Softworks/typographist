import { createBundledDashes } from '@/text/typography/bundled-dashes.factory.js';
import { prepareTextPipeline } from '@/text/typography/prepare-text-pipeline.util.js';
import { Typographist } from '@/typographist/typographist.js';

const id = 'ru/dash/directSpeech';
const rules = createBundledDashes('ru').filter((rule) => rule.id === id);
const format = prepareTextPipeline(rules, 'ru');

describe('Russian direct-speech dashes', () => {
  it.each([
    ['- Привет', '—\u00a0Привет'],
    ['слова\n-- Ответ', 'слова\n—\u00a0Ответ'],
    ['слова\r\n– Ответ', 'слова\r\n—\u00a0Ответ'],
    ['«Привет» - сказал', '«Привет»\u00a0— сказал'],
    ['"Привет"-- ответ', '"Привет"\u00a0— ответ'],
    ['слова,|—|ответ', 'слова,\u00a0— ответ'],
    ['Да! - Ответ', 'Да! —\u00a0Ответ'],
    ['Да…\u00a0‒\u00a0Ответ', 'Да… —\u00a0Ответ'],
    ['', ''],
    [' \r\n\t ', ' \r\n\t '],
    ['-3 1-2 2026-10-08 word-name', '-3 1-2 2026-10-08 word-name'],
    ['—\tОтвет .  - ответ a - b', '—\tОтвет .  - ответ a - b'],
    [
      '$100 100 руб. 12345 1.25 1/2 +7-999-123-45-67 word word MiXeD мiкс 😀 е́',
      '$100 100 руб. 12345 1.25 1/2 +7-999-123-45-67 word word MiXeD мiкс 😀 е́',
    ],
  ])('formats reference fixture %j', (text, expected) => {
    expect(format(text)).toBe(expected);
    expect(format(expected)).toBe(expected);
  });

  it('rejects undeclared settings and supplies only Russian data', () => {
    expect(() => prepareTextPipeline(rules, 'ru', { settings: { [id]: { unknown: true } } })).toThrow(
      'Invalid setting',
    );
    expect(createBundledDashes('en').some((rule) => rule.id === id)).toBe(false);
    expect(createBundledDashes('custom')).toEqual([]);
  });

  it('preserves protected content and original line boundaries', () => {
    const protectedFormat = prepareTextPipeline(rules, 'ru', { protectedContent: ['Keep - this', 'line\n'] });

    expect(protectedFormat('Keep - this- next https://example.com/a-b user-name@example.com')).toBe(
      'Keep - this- next https://example.com/a-b user-name@example.com',
    );
    expect(protectedFormat('line\n- Ответ')).toBe('line\n—\u00a0Ответ');
    expect(protectedFormat('https://example.com- Ответ')).toBe('https://example.com- Ответ');
  });

  it('respects categories', () => {
    for (const categories of [[], ['quotes'], ['hyphenation']] as const) {
      expect(new Typographist({ locale: 'ru', categories }).format('- Да')).toBe('- Да');
    }
    expect(new Typographist({ locale: 'ru', categories: ['dashes'] }).format('- Да')).toBe('—\u00a0Да');
  });

  it.each([false, true])('combines spacing and hyphenation with useFast=%s', (useFast) => {
    const service = new Typographist({ locale: 'ru', useFast });
    const legacy = new Typographist({ locale: 'ru', useFast, categories: ['hyphenation'] });
    const expected = legacy.format('—\u00a0Типографика');

    expect(service.format('-  Типографика')).toBe(expected);
    expect(service.format(expected)).toBe(expected);
  });
});
