import type { PreparedAlgorithm } from '@/algorithms/prepared-algorithm.types.js';
import type { ExclusionOptions } from '@/text/exclusions/exclusion-options.types.js';
import type { LanguagePolicyOptions } from '@/text/language-policy/language-policy-options.types.js';

/** Configuration snapshotted by `createHyphenator` for synchronous text hyphenation. */
export type HyphenationOptions = {
  /** Supplies registered language profiles and candidate word breaks. */
  readonly algorithm: PreparedAlgorithm;
  /** Registered language used when a call does not specify one. Identifiers are matched case-insensitively. */
  readonly defaultLanguage: string;
  /**
   * Selects a registered language for each original word after exclusions pass, or returns null to preserve it.
   * Receives the call's resolved language. Runs synchronously before normalization; callback errors propagate.
   * When omitted, every eligible word uses the call's resolved language.
   */
  readonly wordSelector?: (word: string, language: string) => string | null;
  /** Per-language policy overrides keyed by registered identifiers, matched case-insensitively. */
  readonly languages?: Readonly<Record<string, LanguagePolicyOptions>>;
  /** Controls words preserved without hyphenation. Omitted built-in exclusion toggles default to true. */
  readonly exclusions?: ExclusionOptions;
};

/** Options for one `hyphenate` call, applied before per-word language selection. */
