/** Compiles language patterns and exceptions into an algorithm ready for `createHyphenator`. */
export { prepareKnuthLiang } from '@/algorithms/knuth-liang/prepare-knuth-liang.factory.js';

/** Bundled Russian patterns and exceptions, with two-grapheme minima on each side of a break. */
export { ru } from '@/languages/bundled/ru.constants.js';

/** Bundled US English patterns and exceptions, with left and right minima of two and three graphemes. */
export { enUS } from '@/languages/bundled/en-us.constants.js';

/** Language profile and weighted patterns accepted by `prepareKnuthLiang`. */
export type { KnuthLiangPlugin } from '@/algorithms/knuth-liang/knuth-liang-plugin.types.js';

/** Contract for registered language profiles and synchronous candidate break calculation. */
export type { PreparedAlgorithm } from '@/algorithms/prepared-algorithm.types.js';

/** Explicit word breaks and language normalization settings supplied before algorithm preparation. */
export type { HyphenationException } from '@/languages/exceptions/hyphenation-exception.types.js';

/** Language normalization settings, break minima, and optional exceptions. */
export type { LanguageProfile } from '@/languages/language-profile.types.js';

/** Prepared language settings with exception lookup used by the hyphenation service. */
export type { PreparedLanguageProfile } from '@/languages/prepared-language-profile.types.js';

/** Normalized symbols and their original UTF-16 boundary mappings; normalizers may return null to skip a word. */
export type { WordAnalysis } from '@/languages/analysis/word-analysis.types.js';

/** Synchronous normalization contract; returning null preserves unsupported words. */
export type { WordNormalizer } from '@/languages/analysis/word-normalizer.types.js';

/** Creates a synchronous text hyphenator that inserts soft hyphens at validated word breaks. */
export { createHyphenator } from '@/text/create-hyphenator.factory.js';

/** Controls which candidate words are preserved without hyphenation. */
export type { ExclusionOptions } from '@/text/exclusions/exclusion-options.types.js';

/** Hyphenator setup and per-call language selection options. */
export type { HyphenationCallOptions } from '@/text/hyphenation-call-options.types.js';

/** Algorithm, language selection, policies, and exclusions used to create a hyphenator. */
export type { HyphenationOptions } from '@/text/hyphenation-options.types.js';

/** Per-language overrides for break minima, minimum word length, and exceptions. */
export type { LanguagePolicyOptions } from '@/text/language-policy/language-policy-options.types.js';
