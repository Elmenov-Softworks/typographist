import type { ITypographistRules } from '@/rules/typographist-rules.interfaces.js';
import type { RuleSets } from '@/rules/rule-sets.types.js';

/**
 * Supplies locale rules from paired Knuth–Liang and Khristov datasets, or a subclass's own storage.
 * Typographist calls compile once per registration with its configured useFast flag.
 *
 * @example
 * import { TypographistRules } from '@elmenov-softworks/typographist';
 *
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

  /** Requires both datasets when supplied; omitting them requires a subclass to override compile. */
  constructor(ruleSets: RuleSets<TLocale> | null = null) {
    if (ruleSets !== null) {
      const standard: unknown = ruleSets.standard;
      const fast: unknown = ruleSets.fast;

      if (standard == null || fast == null) {
        throw new TypeError('Supply both standard and fast hyphenation datasets');
      }
    }

    this.#ruleSets = ruleSets;
  }

  /**
   * Selects Khristov rules in fast mode and Knuth–Liang rules in standard mode.
   * Never substitutes the other algorithm's data.
   * Typographist validates and prepares the returned data on registration.
   */
  compile(useFast: boolean) {
    if (this.#ruleSets === null) {
      throw new TypeError('Supply rule sets or override compile in a TypographistRules subclass');
    }

    return useFast ? this.#ruleSets.fast : this.#ruleSets.standard;
  }
}
