import type { Locale } from '@/rules/locale.types.js';
import type { TypographistRules } from '@/rules/typographist-rules.js';

export type TypographistConfig<TCustomLocale extends string = never> = {
  readonly locale?: Locale | NoInfer<TCustomLocale>;
  /** Replaces the bundled English and Russian rules when supplied. */
  readonly rules?: readonly TypographistRules<Locale | TCustomLocale>[];
  /** Exact, case-sensitive words that must remain unchanged. */
  readonly excludedWords?: readonly string[];
  /** Selects the fast mode. Both modes currently use Knuth–Liang. */
  readonly useFast?: boolean;
};
