import type { WordAnalysis } from '#src/languages/analysis/word-analysis.types.js';

export type WordNormalizer = (word: string) => { analysis: WordAnalysis; graphemes: readonly number[] } | null;
