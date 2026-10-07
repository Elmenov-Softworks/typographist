import { Typographist, TypographistRules } from '@/index.js';

describe('Knuth–Liang text integration', () => {
  it.each([
    { word: 'A\u030Abcd', alphabet: 'åbcd', pattern: 'å1b', expected: 'A\u030A\u00adbcd' },
    { word: 'İbcd', alphabet: 'i\u0307bcd', pattern: 'i1\u03071b', expected: 'İ\u00adbcd' },
    { word: 'q\u0301bcd', alphabet: 'q\u0301bcd', pattern: 'q1\u03011b', expected: 'q\u0301\u00adbcd' },
  ])('retains complete graphemes and expansion mappings for $word', ({ word, alphabet, pattern, expected }) => {
    const rules = new TypographistRules({
      fast: { locale: 'en', alphabet, leftMin: 1, rightMin: 1, vowels: '', consonants: alphabet, specialLetters: '' },
      standard: {
        locale: 'en',
        alphabet,
        leftMin: 1,
        rightMin: 1,
        patterns: [pattern],
      },
    });
    const typographist = new Typographist({ rules: [rules] });

    expect(typographist.format(word)).toBe(expected);
    expect(typographist.format(expected)).toBe(expected);
  });

  it('maps canonical exception spellings to original offsets and applies grapheme minima', () => {
    const rules = new TypographistRules({
      fast: {
        locale: 'ru',
        alphabet: 'ёлка',
        leftMin: 2,
        rightMin: 2,
        vowels: 'ёа',
        consonants: 'лк',
        specialLetters: '',
      },
      standard: {
        locale: 'ru',
        alphabet: 'ёлка',
        leftMin: 2,
        rightMin: 2,
        patterns: [],
        exceptions: [{ word: 'ёлка', positions: [2] }],
      },
    });
    const typographist = new Typographist({ locale: 'ru', rules: [rules] });

    expect(typographist.format('е\u0308лка ЁЛКА')).toBe('е\u0308л\u00adка ЁЛ\u00adКА');
  });
});
