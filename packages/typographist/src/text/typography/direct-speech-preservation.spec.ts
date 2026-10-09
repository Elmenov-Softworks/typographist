import { Typographist } from '@/index.js';

describe('direct-speech source preservation', () => {
  it.each([
    ['слова,|--|ответ', 'слова,|--|ответ'],
    ['слова, --\u00a0ответ', 'слова,\u00a0—\u00a0ответ'],
    ['Да…\u00a0--\u00a0Ответ', 'Да…\u00a0—\u00a0Ответ'],
    ['слова, --  ответ', 'слова,\u00a0—  ответ'],
    ['Да! --  Ответ', 'Да!\u00a0—\u00a0 Ответ'],
    ['--  Ответ', '—\u00a0 Ответ'],
    ['слова,\t--\tответ', 'слова,\t--\tответ'],
    ['слова,\r\n-- Ответ', 'слова,\r\n—\u00a0Ответ'],
  ])('preserves source bytes around %j', (input, expected) => {
    const service = new Typographist({ locale: 'ru', useFast: false, cacheSize: 0, categories: ['dashes'] });
    const suffix = '  \t\r\n\n';

    expect(service.format(input + suffix)).toBe(expected + suffix);
    expect(service.format(expected + suffix)).toBe(expected + suffix);
  });

  it('preserves protected punctuation and gaps', () => {
    const protectedContent = 'Да…\u00a0--\u00a0Ответ';
    const service = new Typographist({
      locale: 'ru',
      categories: ['dashes'],
      protectedContent: [protectedContent],
    });

    expect(service.format(protectedContent + '\r\n--  Ответ')).toBe(protectedContent + '\r\n—\u00a0 Ответ');
  });
});
