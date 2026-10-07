import type { LanguageProfile } from '@/languages/language-profile.types.js';

/** Supplies a language profile and its patterns for compilation by `prepareKnuthLiang`. */
export type KnuthLiangPlugin = LanguageProfile & {
  /**
   * Nonempty patterns matched against normalized symbols, with single-digit boundary weights.
   * The strongest matching weight wins; odd weights suggest breaks and even weights suppress them.
   * A leading or trailing `.` anchors a pattern to the word edge. For example, `a1b` suggests a break between `a` and `b`.
   * Patterns must already match the normalizer's output; they are not normalized during compilation.
   */
  readonly patterns: readonly string[];
};
