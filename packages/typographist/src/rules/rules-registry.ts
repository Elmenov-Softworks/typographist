import { createBundledTextRules } from '#src/text/typography/bundled-text-rules.factory.js';
import { prepareTextPipeline } from '#src/text/typography/prepare-text-pipeline.util.js';
import type { TextLocale } from '#src/text/typography/text-locale.types.js';
import type {
  TextPipelineOptions,
  TextRule,
  TextRuleHandler,
  TextRuleSettings,
} from '#src/text/typography/text-rule.types.js';
import { WordCache } from '#src/text/word-cache/word-cache.js';
import { selectAlgorithm, validateAlgorithmRules } from '#src/algorithms/select-algorithm.factory.js';
import { languageKey } from '#src/languages/language-identifier.util.js';
import { TypographistRules } from '#src/rules/typographist-rules.js';
import { createHyphenator } from '#src/text/create-hyphenator.factory.js';

export class RulesRegistry {
  #textRules: readonly TextRule[];
  #options: TextPipelineOptions;
  #declaredSettings: ReadonlyMap<string, TextRuleSettings>;
  #cache: WordCache;
  #services = new Map<string, { hyphenate: TextRuleHandler }>();
  #prepare: ReturnType<typeof selectAlgorithm>;
  #useFast: boolean;
  #excludedWords: ReadonlySet<string>;

  constructor(
    useFast: boolean,
    excludedWords: readonly string[],
    cacheSize: number,
    textRules: readonly TextRule[] = [],
    options: TextPipelineOptions = {},
    textLocales: readonly TextLocale[] = [],
  ) {
    if (!Array.isArray(textRules)) {
      throw new TypeError('textRules must be an array');
    }

    if (options.categories !== undefined && !Array.isArray(options.categories)) {
      throw new TypeError('Invalid formatting categories: expected an array');
    }

    if (options.protectedContent !== undefined && !Array.isArray(options.protectedContent)) {
      throw new TypeError('Protected content must be an array');
    }

    for (const definition of textLocales) {
      if (!Array.isArray(definition.textRules)) {
        throw new TypeError('Locale textRules must be an array');
      }
    }

    const sharedRules: readonly TextRule[] = textRules;
    const selectedCategories: TextPipelineOptions['categories'] = options.categories;
    const protectedContent: TextPipelineOptions['protectedContent'] = options.protectedContent;

    this.#declaredSettings = new Map(
      [
        ...createBundledTextRules('en'),
        ...createBundledTextRules('ru'),
        ...sharedRules,
        ...textLocales.flatMap((definition) => definition.textRules),
      ].map((rule) => [rule.id, { ...rule.defaults }]),
    );

    const settingsMap: unknown = options.settings;

    if (
      settingsMap !== undefined &&
      (typeof settingsMap !== 'object' || settingsMap === null || Array.isArray(settingsMap))
    ) {
      throw new TypeError('Text rule settings must be a non-null, non-array object');
    }

    for (const [id, overrides] of Object.entries(options.settings ?? {})) {
      const overrideMap: unknown = overrides;

      if (typeof overrideMap !== 'object' || overrideMap === null || Array.isArray(overrideMap)) {
        throw new TypeError(`Settings for text rule ${id} must be a non-null, non-array object`);
      }

      const defaults = this.#declaredSettings.get(id);

      if (defaults === undefined) {
        throw new TypeError(`Unknown text rule: ${id}`);
      }

      for (const [name, value] of Object.entries(overrides)) {
        if (!Object.hasOwn(defaults, name) || typeof defaults[name] !== typeof value) {
          throw new TypeError(`Invalid setting ${name} for text rule ${id}`);
        }
      }
    }

    this.#textRules = textRules.map((rule: TextRule) => ({
      ...rule,
      defaults: { ...rule.defaults },
      ...(rule.locales === undefined ? {} : { locales: [...rule.locales] }),
    }));
    this.#options = {
      ...(selectedCategories === undefined ? {} : { categories: [...selectedCategories] }),
      ...(protectedContent === undefined ? {} : { protectedContent: [...protectedContent] }),
      ...(options.settings === undefined
        ? {}
        : {
            settings: Object.fromEntries(
              Object.entries(options.settings).map(([id, settings]) => [id, { ...settings }]),
            ),
          }),
    };
    this.#cache = new WordCache(cacheSize);
    this.#prepare = selectAlgorithm(useFast);
    this.#useFast = useFast;

    if (!Array.isArray(excludedWords) || excludedWords.some((word) => typeof word !== 'string')) {
      throw new TypeError('excludedWords must be an array of strings');
    }

    this.#excludedWords = new Set(excludedWords);
  }

  add(rules: TypographistRules) {
    const { key, service } = this.#compile(rules);

    this.#services.set(key, service);
    this.#cache.clear();
  }

  register(rules: TypographistRules) {
    const { key, service } = this.#compile(rules);

    if (this.#services.has(key)) {
      throw new RangeError(`Duplicate locale rules: ${key}`);
    }

    this.#services.set(key, service);
    this.#cache.clear();
  }

  addTextLocale(definition: TextLocale, replace = false) {
    const key = languageKey(definition.locale);

    if (!Array.isArray(definition.textRules)) {
      throw new TypeError('Locale textRules must be an array');
    }

    if (this.#options.categories?.includes('hyphenation')) {
      throw new TypeError(`Locale ${key} has no hyphenation data`);
    }

    const localeRules: readonly TextRule[] = definition.textRules;
    const format = prepareTextPipeline(
      createBundledTextRules(key, [...this.#textRules, ...localeRules]),
      key,
      this.#options,
      undefined,
      new Set([...this.#declaredSettings.keys(), ...localeRules.map((rule) => rule.id)]),
    );

    if (!replace && this.#services.has(key)) {
      throw new RangeError(`Duplicate locale rules: ${key}`);
    }

    this.#services.set(key, { hyphenate: format });
    this.#cache.clear();
  }

  remove(locale: string) {
    const removed = this.#services.delete(languageKey(locale));

    if (removed) {
      this.#cache.clear();
    }

    return removed;
  }

  has(locale: string) {
    return this.#services.has(languageKey(locale));
  }

  require(locale: string) {
    const service = this.#services.get(languageKey(locale));

    if (service === undefined) {
      throw new RangeError(`Unregistered locale: ${locale}`);
    }

    return service;
  }

  #compile(rules: TypographistRules) {
    if (!(rules instanceof TypographistRules)) {
      throw new TypeError('Rules must extend TypographistRules');
    }

    const compiled = rules.compile(this.#useFast);

    const result: unknown = compiled;

    if (typeof result !== 'object' || result === null || Array.isArray(result)) {
      throw new TypeError('compile must return locale rules synchronously');
    }

    const key = languageKey(compiled.locale);
    const hyphenationEnabled =
      this.#options.categories === undefined || this.#options.categories.includes('hyphenation');

    if (!hyphenationEnabled) {
      validateAlgorithmRules(compiled, this.#useFast);
    }

    const service = hyphenationEnabled
      ? createHyphenator({
          algorithm: this.#prepare(compiled),
          cache: this.#cache,
          locale: key,
          excludedWords: this.#excludedWords,
        })
      : null;

    const format = prepareTextPipeline(
      createBundledTextRules(key, this.#textRules),
      key,
      this.#options,
      service?.hyphenate,
      new Set(this.#declaredSettings.keys()),
      service?.preservesCandidate,
    );

    return { key, service: { hyphenate: format } };
  }
}
