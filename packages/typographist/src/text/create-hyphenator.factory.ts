import type { HyphenationBoundary } from '#src/text/hyphenation-boundary.types.js';
import type { WordCache } from '#src/text/word-cache/word-cache.js';
import { formatWord } from '#src/text/word-breaks/format-word.util.js';
import { formatText } from '#src/text/format-text.util.js';
import type { PreparedAlgorithm } from '#src/algorithms/prepared-algorithm.types.js';
import { prepareExclusions } from '#src/text/exclusions/prepare-exclusions.util.js';

export const createHyphenator = (
  options: {
    algorithm: PreparedAlgorithm;
    excludedWords: ReadonlySet<string>;
  } & ({ cache: WordCache; locale: string } | { cache?: never; locale?: never }),
) => {
  const { algorithm, excludedWords } = options;
  const exclusions = prepareExclusions({ custom: (word) => excludedWords.has(word) });
  const context = { algorithm, exclusions };
  const format = (word: string) => {
    const compute = () => formatWord(word, context);

    return options.cache === undefined ? compute() : options.cache.format(options.locale, word, compute);
  };
  const hyphenate = (text: string, boundary?: HyphenationBoundary) => formatText(text, context, format, boundary);

  const preservesCandidate = (word: string) => exclusions.preserves(word) || algorithm.normalize(word) === null;

  return { hyphenate, preservesCandidate };
};
