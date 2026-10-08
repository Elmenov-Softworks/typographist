import { graphemeSegmenter } from '@/languages/analysis/grapheme-segmenter.constants.js';

const simpleLetters = /^[A-Za-zА-Яа-яЁё]+$/u;

export const createAlphabetNormalizer = (alphabet: string) => {
  const supported = new Set(alphabet);

  return (word: string) => {
    const symbols: string[] = [];
    const boundaries: (number | null)[] = [0];
    const graphemes = [0];

    if (simpleLetters.test(word)) {
      const normalized = word.toLowerCase();

      for (let index = 0; index < normalized.length; index += 1) {
        const symbol = normalized.charAt(index);

        if (!supported.has(symbol)) {
          return null;
        }

        symbols.push(symbol);
        boundaries.push(index + 1);
        graphemes.push(index + 1);
      }

      return { analysis: { symbols, boundaries }, graphemes };
    }

    for (const { index, segment } of graphemeSegmenter.segment(word)) {
      const normalized = segment.normalize('NFC').toLowerCase();

      if (normalized.length === 0) {
        return null;
      }

      for (const symbol of normalized) {
        if (!supported.has(symbol)) {
          return null;
        }

        symbols.push(symbol);
        boundaries.push(null);
      }

      boundaries[boundaries.length - 1] = index + segment.length;
      graphemes.push(index + segment.length);
    }

    return { analysis: { symbols, boundaries }, graphemes };
  };
};
