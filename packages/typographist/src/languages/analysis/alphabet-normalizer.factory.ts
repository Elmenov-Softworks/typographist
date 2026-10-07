import { graphemeSegmenter } from '@/languages/analysis/grapheme-segmenter.constants.js';

/** NFC composition and case expansion retain each original grapheme as a single mapping unit. */
export const createAlphabetNormalizer = (alphabet: string) => {
  const supported = new Set(alphabet);

  return (word: string) => {
    const symbols: string[] = [];
    const boundaries: (number | null)[] = [0];

    for (const { index, segment } of graphemeSegmenter.segment(word)) {
      const normalized = Array.from(segment.normalize('NFC').toLowerCase());

      if (normalized.length === 0 || normalized.some((symbol) => !supported.has(symbol))) {
        return null;
      }

      for (const [position, symbol] of normalized.entries()) {
        symbols.push(symbol);
        boundaries.push(position === normalized.length - 1 ? index + segment.length : null);
      }
    }

    return { symbols, boundaries };
  };
};
