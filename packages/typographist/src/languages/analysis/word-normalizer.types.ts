import type { WordAnalysis } from '@/languages/analysis/word-analysis.types.js';

/**
 * Analyzes a complete original word synchronously, or returns null when the word is unsupported.
 * Unsupported words remain unchanged; malformed analysis is rejected before exception or algorithm callbacks.
 */
export type WordNormalizer = (word: string) => WordAnalysis | null;
