import type { WordAnalysis } from '@/languages/analysis/word-analysis.types.js';
import type { WordNormalizer } from '@/languages/analysis/word-normalizer.types.js';

/** Language normalization, break minima, and exception lookup used by a prepared algorithm. */
export type PreparedLanguageProfile = {
  /** Language identifier matched case-insensitively without region fallback. */
  readonly id: string;
  /** Synchronously maps a word to matching symbols and original UTF-16 boundaries, or null to skip it. */
  readonly normalize: WordNormalizer;
  /** Positive safe integer minimum of original graphemes before a break; policies may only raise it. */
  readonly leftMin: number;
  /** Positive safe integer minimum of original graphemes after a break; policies may only raise it. */
  readonly rightMin: number;
  /**
   * Synchronously returns exception breaks as original UTF-16 offsets for validated analysis.
   * Null falls through to the algorithm; an empty array prevents breaks. Policy exceptions take precedence.
   */
  readonly exceptionBreaks: (analysis: WordAnalysis) => readonly number[] | null;
};
