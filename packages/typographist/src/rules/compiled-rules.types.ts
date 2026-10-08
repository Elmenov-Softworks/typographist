import type { LanguageRules } from '@/rules/language-rules.types.js';

/** Knuth–Liang locale data returned by a rule plugin. */
export type CompiledRules<TLocale extends string = string> = LanguageRules<TLocale> & {
  /** Patterns with single-digit weights and optional leading or trailing '.' word anchors. */
  readonly patterns: readonly string[];
};
