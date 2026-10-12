import type { TextPipelineOptions, TextRule } from '#src/text/typography/text-rule.types.js';
import type { TextLocale } from '#src/text/typography/text-locale.types.js';
import type { Locale } from '#src/rules/locale.types.js';
import type { TypographistRules } from '#src/rules/typographist-rules.js';

/** Locale selection, rule plugins, and exclusions used to create a Typographist instance. */
export type TypographistConfig<TCustomLocale extends string = never> = TextPipelineOptions & {
  /** Additional typography-only locales; defaults apply available text capabilities. */
  readonly textLocales?: readonly TextLocale<Locale | TCustomLocale>[];
  /** Symbolic text rules prepared once per locale, independently of hyphenation data. */
  readonly textRules?: readonly TextRule[];
  /** Unregistered locales throw by default; preserve returns the exact source text instead. */
  readonly unsupportedLocale?: 'preserve' | 'throw';
  /** Default locale for calls without an override; defaults to 'en' and follows unsupportedLocale. */
  readonly locale?: Locale | NoInfer<TCustomLocale>;
  /** Replaces the bundled English and Russian plugins when supplied; each locale must be unique. */
  readonly rules?: readonly TypographistRules<Locale | TCustomLocale>[];
  /** Exact, case-sensitive words to preserve; copied at construction and empty by default. */
  readonly excludedWords?: readonly string[];
  /** Selects heuristic Khristov hyphenation when true; false or omitted selects Knuth–Liang. */
  readonly useFast?: boolean;
  /**
   * Estimated word-cache budget in MiB shared across this instance's locales; defaults to 64.
   * Must be finite and non-negative; fractions are valid and zero disables caching.
   * Least recently used entries are evicted to fit the budget, which is not a measured heap limit.
   */
  readonly cacheSize?: number;
};
