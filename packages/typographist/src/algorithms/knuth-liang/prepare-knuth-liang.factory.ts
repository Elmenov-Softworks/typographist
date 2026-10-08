import { prepareLanguage } from '@/languages/prepare-language.factory.js';
import type { WordAnalysis } from '@/languages/analysis/word-analysis.types.js';
import type { CompiledRules } from '@/rules/compiled-rules.types.js';
import { preparePatternMatcher } from '@/algorithms/knuth-liang/pattern-matcher.util.js';

export const prepareKnuthLiang = (rules: CompiledRules) => {
  const language = prepareLanguage(rules);
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

  return Object.freeze({ ...language, wordBreaks });
};
