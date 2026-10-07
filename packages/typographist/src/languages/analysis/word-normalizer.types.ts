import type { WordAnalysis } from '@/languages/analysis/word-analysis.types.js';

export type WordNormalizer = (word: string) => WordAnalysis | null;
