import { prepareKhristov } from '#src/algorithms/khristov/prepare-khristov.factory.js';
import { alphabeticKhristovRules } from '#src/languages/bundled/alphabetic-khristov.constants.js';
import { prepareExclusions } from '#src/text/exclusions/prepare-exclusions.util.js';
import { formatWord } from '#src/text/word-breaks/format-word.util.js';

const examples = [
  { locale: 'es', word: 'constitución', expected: 'cons|ti|tu|ci|ón' },
  { locale: 'fr', word: 'éléphant', expected: 'élép|hant' },
  { locale: 'de', word: 'übertragung', expected: 'übert|ra|gung' },
  { locale: 'pt', word: 'coração', expected: 'co|ra|ção' },
  { locale: 'it', word: 'città', expected: 'cit|tà' },
];

describe('additional bundled Khristov classifications', () => {
  it.each(examples)('hyphenates $locale with canonical and uppercase equivalence', ({ locale, word, expected }) => {
    const rules = alphabeticKhristovRules.find((entry) => entry.locale === locale);
    if (!rules) throw new Error(`Missing fixture rules: ${locale}`);
    const context = { algorithm: prepareKhristov(rules), exclusions: prepareExclusions({}) };

    for (const input of [word, word.toUpperCase(), word.normalize('NFD')]) {
      const output = formatWord(input, context);

      expect(output.normalize('NFC').toLowerCase()).toBe(expected.replaceAll('|', '\u00ad'));
      expect(output.replaceAll('\u00ad', '')).toBe(input);
      expect(formatWord(output, context)).toBe(output);
    }
  });

  it.each(alphabeticKhristovRules)('preserves unsupported tokens for $locale', (rules) => {
    const context = { algorithm: prepareKhristov(rules), exclusions: prepareExclusions({}) };

    for (const word of ['汉字', 'abc\u0301def', "l'amour", 'user@example.com', 'ISO9001']) {
      expect(formatWord(word, context)).toBe(word);
    }
  });

  it('uses Portuguese source exceptions before heuristic breaks', () => {
    const rules = alphabeticKhristovRules.find((entry) => entry.locale === 'pt');
    if (!rules) throw new Error('Missing Portuguese fixture rules');
    const context = { algorithm: prepareKhristov(rules), exclusions: prepareExclusions({}) };

    expect(formatWord('hardware', context)).toBe('hard\u00adware');
    expect(formatWord('software', context)).toBe('soft\u00adware');
  });
});
