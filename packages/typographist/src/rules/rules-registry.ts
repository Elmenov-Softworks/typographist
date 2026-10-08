import { WordCache } from '@/text/word-cache/word-cache.js';
import { selectAlgorithm } from '@/algorithms/select-algorithm.factory.js';
import { languageKey } from '@/languages/language-identifier.util.js';
import { TypographistRules } from '@/rules/typographist-rules.js';
import { createHyphenator } from '@/text/create-hyphenator.factory.js';

export class RulesRegistry {
  #cache: WordCache;
  #services = new Map<string, ReturnType<typeof createHyphenator>>();
  #prepare: ReturnType<typeof selectAlgorithm>;
  #useFast: boolean;
  #excludedWords: ReadonlySet<string>;

  constructor(useFast: boolean, excludedWords: readonly string[], cacheSize: number) {
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

    return { key, service };
  }
}
