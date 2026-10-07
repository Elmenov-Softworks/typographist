import type { WordAnalysis } from '@/languages/analysis/word-analysis.types.js';
import type { WordNormalizer } from '@/languages/analysis/word-normalizer.types.js';

export type PreparedLanguageProfile = {
  readonly id: string;
  readonly normalize: WordNormalizer;
  readonly leftMin: number;
  readonly rightMin: number;
  readonly exceptionBreaks: (analysis: WordAnalysis) => readonly number[] | null;
};
