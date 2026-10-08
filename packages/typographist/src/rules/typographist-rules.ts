import type { ITypographistRules } from '@/rules/typographist-rules.interfaces.js';
import type { RuleSets } from '@/rules/rule-sets.types.js';

/**
 * Supplies locale rules from Knuth–Liang and Khristov datasets, or from a subclass's own storage.
 * Typographist calls compile once per registration with its configured useFast flag.
 *
 * @example
 * const rules = new TypographistRules({
 *   standard: {
 *     locale: 'en', alphabet: 'abcd', leftMin: 1, rightMin: 1, patterns: ['a1b'],
 *   },
 *   fast: {
 *     locale: 'en', alphabet: 'abcd', leftMin: 1, rightMin: 1,
 *     vowels: 'a', consonants: 'bcd', specialLetters: '',
 *   },
 * });
 * rules.compile(true); // Returns Khristov classifications.
 */
export class TypographistRules<TLocale extends string = string> implements ITypographistRules<TLocale> {
  #ruleSets: RuleSets<TLocale> | null;

  /** Stores supplied datasets; omitting them requires a subclass to override compile. */
  constructor(ruleSets: RuleSets<TLocale> | null = null) {
    this.#ruleSets = ruleSets;
  }

  /**
   * Selects Khristov rules in fast mode and Knuth–Liang rules in standard mode.
   * Throws when no datasets were supplied. Typographist validates and prepares the returned data on registration.
   */
  compile(useFast: boolean) {
    if (this.#ruleSets === null) {
      throw new TypeError('Supply rule sets or override compile in a TypographistRules subclass');
    }

    const selected = useFast ? this.#ruleSets.fast : this.#ruleSets.standard;

    const result: unknown = selected;

    if (result == null) {
      throw new TypeError('Supply data for the selected hyphenation algorithm');
    }

    return selected;
  }
}
