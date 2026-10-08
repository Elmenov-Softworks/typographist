import type { WordCache } from '@/text/word-cache/word-cache.js';
import { formatWord } from '@/text/word-breaks/format-word.util.js';
import { formatText } from '@/text/format-text.util.js';
import type { PreparedAlgorithm } from '@/algorithms/prepared-algorithm.types.js';
import { prepareExclusions } from '@/text/exclusions/prepare-exclusions.util.js';

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
  const hyphenate = (text: string) => formatText(text, context, format);

  return { hyphenate };
};
