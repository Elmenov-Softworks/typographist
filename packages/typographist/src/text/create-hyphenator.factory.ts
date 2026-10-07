import { formatText } from '@/text/format-text.util.js';
import type { PreparedAlgorithm } from '@/algorithms/prepared-algorithm.types.js';
import { prepareExclusions } from '@/text/exclusions/prepare-exclusions.util.js';

export const createHyphenator = (options: { algorithm: PreparedAlgorithm; excludedWords: ReadonlySet<string> }) => {
  const { algorithm, excludedWords } = options;
  const exclusions = prepareExclusions({ custom: (word) => excludedWords.has(word) });
  const context = { algorithm, exclusions };
  const hyphenate = (text: string) => formatText(text, context);

  return { hyphenate };
};
