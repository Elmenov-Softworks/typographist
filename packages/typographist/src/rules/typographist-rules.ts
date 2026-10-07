import type { ITypographistRules } from '@/rules/typographist-rules.interfaces.js';
import type { RuleSets } from '@/rules/rule-sets.types.js';

/**
 * Supplies locale rules from standard and optional fast datasets, or from a subclass's own storage.
 * Typographist calls compile once per registration with its configured useFast flag.
 *
 * @example
 * const rules = new TypographistRules({
 *   standard: {
 *     locale: 'en', alphabet: 'abcd', leftMin: 1, rightMin: 1, patterns: ['a1b'],
 *   },
 * });
 * rules.compile(true); // Falls back to the standard dataset when fast rules are absent.
 */
export class TypographistRules<TLocale extends string = string> implements ITypographistRules<TLocale> {
  #ruleSets: RuleSets<TLocale> | null;

  /** Stores supplied datasets; omitting them requires a subclass to override compile. */
  constructor(ruleSets: RuleSets<TLocale> | null = null) {
    this.#ruleSets = ruleSets;
  }

  /**
   * Selects fast rules when requested and available, otherwise standard rules.
   * Throws when no datasets were supplied. Typographist validates and prepares the returned data on registration.
   */
  compile(useFast: boolean) {
    if (this.#ruleSets === null) {
      throw new TypeError('Supply rule sets or override compile in a TypographistRules subclass');
    }

    return useFast ? (this.#ruleSets.fast ?? this.#ruleSets.standard) : this.#ruleSets.standard;
  }
}
