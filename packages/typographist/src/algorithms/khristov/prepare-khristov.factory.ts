import { matchKhristovClasses } from '@/algorithms/khristov/class-matcher.util.js';
import type { KhristovRules } from '@/algorithms/khristov/khristov-rules.types.js';
import type { WordAnalysis } from '@/languages/analysis/word-analysis.types.js';
import { prepareLanguage } from '@/languages/prepare-language.factory.js';

export const prepareKhristov = (rules: KhristovRules) => {
  const language = prepareLanguage(rules);
  const alphabet = new Set(rules.alphabet);
  const classifications = new Map<string, string>();
  const sets = [
    { letters: rules.vowels, category: 'V' },
    { letters: rules.consonants, category: 'C' },
    { letters: rules.specialLetters, category: 'X' },
  ];

  for (const { letters, category } of sets) {
    if (typeof letters !== 'string') {
      throw new TypeError('Khristov classifications must be strings');
    }

    for (const symbol of letters) {
      if (!alphabet.has(symbol) || symbol.normalize('NFC').toLowerCase() !== symbol) {
        throw new TypeError('Khristov classifications require normalized alphabet symbols');
      }

      if (classifications.has(symbol)) {
        throw new TypeError('Khristov classifications must be disjoint without duplicate symbols');
      }

      classifications.set(symbol, category);
    }
  }

  if (classifications.size !== alphabet.size) {
    throw new TypeError('Khristov classifications must cover the complete alphabet');
  }

  const wordBreaks = (analysis: WordAnalysis) => {
    const classes = analysis.symbols.map((symbol) => {
      const category = classifications.get(symbol);

      if (category === undefined) {
        throw new TypeError('Khristov analysis contains an unsupported symbol');
      }

      return category;
    });
    const positions: number[] = [];

    for (const boundary of matchKhristovClasses(classes)) {
      const offset = analysis.boundaries[boundary];

      if (offset != null) {
        positions.push(offset);
      }
    }

    return positions;
  };

  return Object.freeze({ ...language, wordBreaks });
};
