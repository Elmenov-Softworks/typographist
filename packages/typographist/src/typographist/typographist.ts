import { createBundledRules } from '@/rules/bundled/bundled-rules.js';
import type { Locale } from '@/rules/locale.types.js';
import { RulesRegistry } from '@/rules/rules-registry.js';
import type { TypographistRules } from '@/rules/typographist-rules.js';
import type { TypographistConfig } from '@/typographist/typographist-config.types.js';

/**
 * Inserts soft hyphens using registered locale rules while preserving original characters.
 * Custom locale types can be inferred from configured plugins or declared as a generic union.
 *
 * @example
 * const typographist = new Typographist({ locale: 'ru' });
 * typographist.format('машина');
 * typographist.format('table', 'en'); // Uses English rules for this call only.
 */
export class Typographist<TCustomLocale extends string = never> {
  #locale: Locale | TCustomLocale;
  #rules: RulesRegistry;

  /**
   * Registers and prepares rules once, defaulting to English with bundled English and Russian rules.
   * Copies excluded words. Invalid configuration, duplicate locales, or a missing default locale throw.
   */
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

  /**
   * Compiles and registers rules for the plugin's locale, replacing any previous registration.
   * Compilation or validation errors propagate and leave the previous rules intact.
   */
  addRules(rules: TypographistRules) {
    this.#rules.add(rules);
  }

  /**
   * Removes registered rules and reports whether the locale was present.
   * Removing the default locale makes calls without an override fail until its rules are added again.
   */
  removeRules(locale: Locale | TCustomLocale) {
    return this.#rules.remove(locale);
  }

  /**
   * Formats text synchronously using the requested locale or the configured default.
   * An override affects only this call; selecting an unregistered locale throws even for empty text.
   * Preserves excluded words, recognized addresses, identifiers, unsupported words, and existing soft hyphens.
   */
  format(text: string, locale: Locale | TCustomLocale = this.#locale) {
    return this.#rules.require(locale).hyphenate(text);
  }
}
