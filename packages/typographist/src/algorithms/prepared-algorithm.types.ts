import type { WordAnalysis } from '@/languages/analysis/word-analysis.types.js';
import type { WordNormalizer } from '@/languages/analysis/word-normalizer.types.js';

/** Prepared strategy for one locale; locale selection belongs to the rules registry. */
export type PreparedAlgorithm = {
  readonly normalize: WordNormalizer;
  readonly leftMin: number;
  readonly rightMin: number;
  readonly exceptionBreaks: (analysis: WordAnalysis) => readonly number[] | null;
  readonly wordBreaks: (analysis: WordAnalysis) => readonly number[];
};
