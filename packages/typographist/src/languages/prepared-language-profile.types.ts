import type { WordAnalysis, WordNormalizer } from './word-analysis.types.js';

export type PreparedLanguageProfile = {
  readonly id: string;
  readonly normalize: WordNormalizer;
  readonly leftMin: number;
  readonly rightMin: number;
  readonly exceptionBreaks: (analysis: WordAnalysis) => readonly number[] | null;
};
