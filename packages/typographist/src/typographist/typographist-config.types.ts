import type { Locale } from '@/rules/locale.types.js';
import type { TypographistRules } from '@/rules/typographist-rules.js';

/** Locale selection, rule plugins, and exclusions used to create a Typographist instance. */
export type TypographistConfig<TCustomLocale extends string = never> = {
  /** Default locale for calls without an override; defaults to 'en' and requires registered rules. */
  readonly locale?: Locale | NoInfer<TCustomLocale>;
  /** Replaces the bundled English and Russian plugins when supplied; each locale must be unique. */
  readonly rules?: readonly TypographistRules<Locale | TCustomLocale>[];
  /** Exact, case-sensitive words to preserve; copied at construction and empty by default. */
  readonly excludedWords?: readonly string[];
  /** Requests fast rule sets and the fast strategy; defaults to false. Both strategies currently use Knuth–Liang. */
  readonly useFast?: boolean;
};
