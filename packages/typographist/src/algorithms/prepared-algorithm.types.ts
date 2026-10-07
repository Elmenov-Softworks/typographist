import type { WordAnalysis } from '@/languages/analysis/word-analysis.types.js';
import type { WordNormalizer } from '@/languages/analysis/word-normalizer.types.js';

export type PreparedAlgorithm = {
  readonly normalize: WordNormalizer;
  readonly leftMin: number;
  readonly rightMin: number;
  readonly exceptionBreaks: (analysis: WordAnalysis) => readonly number[] | null;
  readonly wordBreaks: (analysis: WordAnalysis) => readonly number[];
};
