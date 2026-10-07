import type { ITypographistRules } from '@/rules/typographist-rules.interfaces.js';
import type { RuleSets } from '@/rules/rule-sets.types.js';

/**
 * Extend to supply locale rules. Storage belongs to the plugin.
 * compile is called once on registration with the configured algorithm flag.
 * The default compiler selects the requested rule set, falling back to standard.
 * Override compile when using custom storage.
 */
export class TypographistRules<TLocale extends string = string> implements ITypographistRules<TLocale> {
  #ruleSets: RuleSets<TLocale> | null;

  constructor(ruleSets: RuleSets<TLocale> | null = null) {
    this.#ruleSets = ruleSets;
  }

  compile(useFast: boolean) {
    if (this.#ruleSets === null) {
      throw new TypeError('Supply rule sets or override compile in a TypographistRules subclass');
    }

    return useFast ? (this.#ruleSets.fast ?? this.#ruleSets.standard) : this.#ruleSets.standard;
  }
}
