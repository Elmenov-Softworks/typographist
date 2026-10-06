import type { PreparedLanguageProfile } from '../languages/prepared-language-profile.types.js';
import type { WordAnalysis } from '../languages/word-analysis.types.js';

export type PreparedAlgorithm = {
  readonly languages: readonly PreparedLanguageProfile[];
  readonly wordBreaks: (word: string, language: string, analysis: WordAnalysis) => readonly number[];
};
