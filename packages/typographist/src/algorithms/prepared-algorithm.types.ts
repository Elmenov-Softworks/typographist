import type { PreparedLanguageProfile } from '@/languages/prepared-language-profile.types.js';
import type { WordAnalysis } from '@/languages/analysis/word-analysis.types.js';

/** Supplies language profiles and synchronous word-break calculation to the hyphenation service. */
export type PreparedAlgorithm = {
  /** Registered language profiles used for normalization, exceptions, and default hyphenation limits. */
  readonly languages: readonly PreparedLanguageProfile[];
  /**
   * Calculates candidate breaks for the original word using its selected profile identifier and validated analysis.
   * Called when no exception applies. Offsets must be strictly increasing, unique UTF-16 positions at original
   * grapheme boundaries inside the word; an empty array means no breaks. The service applies minimum-length limits.
   */
  readonly wordBreaks: (word: string, language: string, analysis: WordAnalysis) => readonly number[];
};
