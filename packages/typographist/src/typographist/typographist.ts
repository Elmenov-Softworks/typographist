import { createBundledRules } from '@/rules/bundled/bundled-rules.js';
import type { Locale } from '@/rules/locale.types.js';
import { RulesRegistry } from '@/rules/rules-registry.js';
import type { TypographistRules } from '@/rules/typographist-rules.js';
import type { TypographistConfig } from '@/typographist/typographist-config.types.js';

export class Typographist<TCustomLocale extends string = never> {
  #locale: Locale | TCustomLocale;
  #rules: RulesRegistry;

  constructor(config: TypographistConfig<TCustomLocale> = {}) {
    const input: unknown = config;

    if (typeof input !== 'object' || input === null || Array.isArray(input)) {
      throw new TypeError('Typographist config must be an object');
    }

    const { locale = 'en', useFast = false, excludedWords = [], rules = createBundledRules() } = config;
    this.#locale = locale;
    this.#rules = new RulesRegistry(useFast, excludedWords);

    if (!Array.isArray(rules)) {
      throw new TypeError('rules must be an array of TypographistRules instances');
    }

    const entries: readonly TypographistRules[] = rules;

    for (const entry of entries) {
      this.#rules.register(entry);
    }

    this.#rules.require(this.#locale);
  }

  /** Adds or atomically replaces the rules for the plugin's locale. */
  addRules(rules: TypographistRules) {
    this.#rules.add(rules);
  }

  /** Removing the default locale makes format without an override fail until it is registered again. */
  removeRules(locale: Locale | TCustomLocale) {
    return this.#rules.remove(locale);
  }

  format(text: string, locale: Locale | TCustomLocale = this.#locale) {
    return this.#rules.require(locale).hyphenate(text);
  }
}
