import type { WordAnalysis } from '@/languages/analysis/word-analysis.types.js';

export type WordNormalizer = (word: string) => { analysis: WordAnalysis; graphemes: readonly number[] } | null;
