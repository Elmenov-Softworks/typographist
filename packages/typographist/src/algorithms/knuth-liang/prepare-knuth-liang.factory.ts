import { createAlphabetNormalizer } from '@/languages/analysis/alphabet-normalizer.factory.js';
import { prepareExceptionTable } from '@/languages/exceptions/exception-table.util.js';
import type { WordAnalysis } from '@/languages/analysis/word-analysis.types.js';
import type { CompiledRules } from '@/rules/compiled-rules.types.js';
import { preparePatternMatcher } from '@/algorithms/knuth-liang/pattern-matcher.util.js';

export const prepareKnuthLiang = (rules: CompiledRules) => {
  if (typeof rules.alphabet !== 'string' || rules.alphabet.length === 0) {
    throw new TypeError('Rules require a nonempty alphabet');
  }

  if (/[\p{Cs}]/u.test(rules.alphabet)) {
    throw new TypeError('Rules alphabet must contain Unicode scalar values');
  }

  for (const value of [rules.leftMin, rules.rightMin]) {
    if (!Number.isSafeInteger(value) || value < 1) {
      throw new RangeError(`Locale ${rules.locale} requires positive safe integer minima`);
    }
  }

  const { leftMin, rightMin, exceptions: entries = [] } = rules;
  const normalize = createAlphabetNormalizer(rules.alphabet);
  const exceptions = prepareExceptionTable(entries, normalize);
  const matcher = preparePatternMatcher(rules.patterns);
  const wordBreaks = (analysis: WordAnalysis) => {
    const positions: number[] = [];

    for (const boundary of matcher.match(analysis.symbols)) {
      const offset = analysis.boundaries[boundary];

      if (offset != null) {
        positions.push(offset);
      }
    }

    return positions;
  };

  return Object.freeze({ normalize, leftMin, rightMin, exceptionBreaks: exceptions.lookup, wordBreaks });
};
