import type { TextRule } from '@/text/typography/text-rule.types.js';

/** A consumer locale supporting symbolic typography without hyphenation data. */
export type TextLocale<TLocale extends string = string> = {
  /** Registration key, matched case-insensitively without region fallback. */
  readonly locale: TLocale;
  /** Locale-owned rules combined with the service's shared text rules. */
  readonly textRules: readonly TextRule[];
};
