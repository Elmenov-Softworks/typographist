import { prepareExceptionTable } from '@/languages/exceptions/exception-table.util.js';
import { languageKey } from '@/languages/language-identifier.util.js';
import type { PreparedLanguageProfile } from '@/languages/prepared-language-profile.types.js';
import type { PreparedAlgorithm } from '@/algorithms/prepared-algorithm.types.js';
import type { KnuthLiangPlugin } from '@/algorithms/knuth-liang/knuth-liang-plugin.types.js';
import { preparePatternMatcher } from '@/algorithms/knuth-liang/pattern-matcher.util.js';

const validatePluginObject = (plugin: unknown) => {
  if (typeof plugin !== 'object' || plugin === null) {
    throw new TypeError('Knuth–Liang plugin must be an object');
  }
};

export const prepareKnuthLiang = (plugins: readonly KnuthLiangPlugin[]) => {
  if (!Array.isArray(plugins)) {
    throw new TypeError('Knuth–Liang plugins must be an array');
  }

  const matchers = new Map<string, ReturnType<typeof preparePatternMatcher>>();
  const languages: PreparedLanguageProfile[] = [];
  const input: readonly KnuthLiangPlugin[] = plugins;

  for (const plugin of input) {
    validatePluginObject(plugin);
    const key = languageKey(plugin.id);

    if (matchers.has(key)) {
      throw new RangeError(`Duplicate language registration: ${plugin.id}`);
    }

    if (typeof plugin.normalize !== 'function') {
      throw new TypeError(`Language ${plugin.id} requires a normalizer`);
    }

    for (const value of [plugin.leftMin, plugin.rightMin]) {
      if (typeof value !== 'number' || !Number.isSafeInteger(value) || value < 1) {
        throw new RangeError(`Language ${plugin.id} requires positive safe integer minima`);
      }
    }

    const exceptions = prepareExceptionTable(
      plugin.exceptions === undefined ? [] : plugin.exceptions,
      plugin.normalize,
    );
    const matcher = preparePatternMatcher(plugin.patterns);
    matchers.set(key, matcher);
    languages.push(
      Object.freeze({
        id: plugin.id,
        normalize: plugin.normalize,
        leftMin: plugin.leftMin,
        rightMin: plugin.rightMin,
        exceptionBreaks: exceptions.lookup,
      }),
    );
  }

  const wordBreaks: PreparedAlgorithm['wordBreaks'] = (_word, language, analysis) => {
    const matcher = matchers.get(languageKey(language));

    if (matcher === undefined) {
      throw new RangeError(`Unregistered language: ${language}`);
    }

    const positions: number[] = [];

    for (const boundary of matcher.match(analysis.symbols)) {
      const offset = analysis.boundaries[boundary];

      if (offset !== null && offset !== undefined) {
        positions.push(offset);
      }
    }

    return positions;
  };

  const algorithm: PreparedAlgorithm = Object.freeze({ languages: Object.freeze(languages), wordBreaks });

  return algorithm;
};
