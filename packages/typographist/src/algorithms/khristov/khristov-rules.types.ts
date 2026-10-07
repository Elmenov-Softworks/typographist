import type { LanguageRules } from '@/rules/language-rules.types.js';

/** Complete, disjoint character classifications for normalized supported symbols. */
export type KhristovRules<TLocale extends string = string> = LanguageRules<TLocale> & {
  /** Vowel symbols, including context-free English y in bundled rules. */
  readonly vowels: string;
  /** Consonant symbols classified individually, without digraph units. */
  readonly consonants: string;
  /** Special symbols such as Russian й, ь, and ъ; an empty set is valid. */
  readonly specialLetters: string;
};
