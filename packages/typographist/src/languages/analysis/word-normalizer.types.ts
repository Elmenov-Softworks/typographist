import type { WordAnalysis } from '@/languages/analysis/word-analysis.types.js';

/**
 * Analyzes a complete original word synchronously, or returns null when the word is unsupported.
 * Includes original grapheme boundaries collected during normalization.
 */
export type WordNormalizer = (word: string) => { analysis: WordAnalysis; graphemes: readonly number[] } | null;
