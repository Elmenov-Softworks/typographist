import { createBundledDashes } from '@/text/typography/bundled-dashes.factory.js';
import { prepareTextPipeline } from '@/text/typography/prepare-text-pipeline.util.js';
import { createBundledSpacing } from '@/text/typography/bundled-spacing.factory.js';
import { createBundledPunctuation } from '@/text/typography/bundled-punctuation.factory.js';
import type { TextLocale } from '@/text/typography/text-locale.types.js';
import type { TextPipelineOptions, TextRule, TextRuleHandler } from '@/text/typography/text-rule.types.js';
import { WordCache } from '@/text/word-cache/word-cache.js';
import { selectAlgorithm } from '@/algorithms/select-algorithm.factory.js';
import { languageKey } from '@/languages/language-identifier.util.js';
import { TypographistRules } from '@/rules/typographist-rules.js';
import { createHyphenator } from '@/text/create-hyphenator.factory.js';

export class RulesRegistry {
  #textRules: readonly TextRule[];
  #options: TextPipelineOptions;
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
  ) {
    if (!Array.isArray(textRules)) {
      throw new TypeError('textRules must be an array');
    }

    this.#textRules = textRules.map((rule: TextRule) => ({
      ...rule,
      defaults: { ...rule.defaults },
      ...(rule.locales === undefined ? {} : { locales: [...rule.locales] }),
    }));
    this.#options = {
      ...(options.categories === undefined ? {} : { categories: [...options.categories] }),
      ...(options.protectedContent === undefined ? {} : { protectedContent: [...options.protectedContent] }),
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
      [
        ...createBundledSpacing(key),
        ...createBundledDashes(key),
        ...createBundledPunctuation(key),
        ...this.#textRules,
        ...localeRules,
      ],
      key,
      this.#options,
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
    const algorithm = this.#prepare(compiled);
    const service = createHyphenator({
      algorithm,
      cache: this.#cache,
      locale: key,
      excludedWords: this.#excludedWords,
    });

    const hyphenationEnabled =
      this.#options.categories === undefined || this.#options.categories.includes('hyphenation');
    const format = prepareTextPipeline(
      [...createBundledSpacing(key), ...createBundledDashes(key), ...createBundledPunctuation(key), ...this.#textRules],
      key,
      this.#options,
      hyphenationEnabled ? service.hyphenate : (text) => text,
    );

    return { key, service: { hyphenate: format } };
  }
}
