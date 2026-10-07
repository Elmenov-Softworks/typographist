import type { WordNormalizer } from '@/languages/analysis/word-normalizer.types.js';

import type { HyphenationException } from '@/languages/exceptions/hyphenation-exception.types.js';

/** Language normalization, break minima, and optional exceptions supplied before algorithm preparation. */
export type LanguageProfile = {
  /** Language identifier matched case-insensitively, without region fallback. */
  readonly id: string;
  /** Synchronously maps a word to symbols and original boundaries, or returns null for unsupported words. */
  readonly normalize: WordNormalizer;
  /** Minimum original graphemes before a break; must be a positive safe integer. */
  readonly leftMin: number;
  /** Minimum original graphemes after a break; must be a positive safe integer. */
  readonly rightMin: number;
  /** Explicit breaks that take precedence over algorithm results; omission supplies no exceptions. */
  readonly exceptions?: readonly HyphenationException[];
};
