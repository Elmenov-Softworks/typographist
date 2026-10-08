import { insertWordBreaks } from '@/text/word-breaks/insert-word-breaks.util.js';
import type { TextFormattingContext } from '@/text/text-formatting-context.types.js';

export const formatWord = (word: string, context: TextFormattingContext) => {
  const { algorithm } = context;

  if (word.length < algorithm.leftMin + algorithm.rightMin) {
    return word;
  }

  const normalized = algorithm.normalize(word);

  if (normalized === null) {
    return word;
  }

  const { analysis, graphemes } = normalized;
  const positions = algorithm.exceptionBreaks(analysis) ?? algorithm.wordBreaks(analysis);

  return insertWordBreaks(word, positions, graphemes, algorithm.leftMin, algorithm.rightMin);
};
