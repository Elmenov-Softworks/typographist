import type { WordAnalysis } from './word-analysis.types.js';

const segmenter = new Intl.Segmenter('und', { granularity: 'grapheme' });

export const getGraphemeBoundaries = (word: string) => {
  const boundaries = [0];
  for (const { index, segment } of segmenter.segment(word)) {
    boundaries.push(index + segment.length);
  }
  return boundaries;
};

/** Validates caller-owned analysis once and snapshots it before invoking an algorithm. */
export const validateWordAnalysis = (word: string, result: unknown) => {
  if (result === null) {
    return null;
  }
  if (
    typeof result !== 'object' ||
    !('symbols' in result) ||
    !('boundaries' in result) ||
    !Array.isArray(result.symbols) ||
    !Array.isArray(result.boundaries)
  ) {
    throw new TypeError('Language normalizer must return synchronous word analysis or null');
  }

  const symbols: string[] = [];
  for (const symbol of result.symbols) {
    if (typeof symbol !== 'string' || Array.from(symbol).length !== 1 || /[\p{Cs}]/u.test(symbol)) {
      throw new TypeError('Language analysis symbols must be Unicode code points');
    }
    symbols.push(symbol);
  }

  if (
    result.boundaries.length !== symbols.length + 1 ||
    result.boundaries[0] !== 0 ||
    result.boundaries[result.boundaries.length - 1] !== word.length
  ) {
    throw new TypeError('Language analysis must map both endpoints and every inter-symbol boundary');
  }

  const graphemes = getGraphemeBoundaries(word);
  const boundaries: (number | null)[] = [];
  let graphemeIndex = 0;
  for (const boundary of result.boundaries) {
    if (boundary === null) {
      boundaries.push(null);
      continue;
    }
    if (typeof boundary !== 'number') {
      throw new TypeError('Language analysis boundaries must be numbers or null');
    }
    if (!Number.isSafeInteger(boundary) || boundary !== graphemes[graphemeIndex]) {
      throw new RangeError('Language analysis contains an invalid original boundary');
    }
    graphemeIndex += 1;
    boundaries.push(boundary);
  }

  if (graphemeIndex !== graphemes.length) {
    throw new RangeError('Language analysis must retain every original grapheme boundary');
  }

  const analysis: WordAnalysis = Object.freeze({
    symbols: Object.freeze(symbols),
    boundaries: Object.freeze(boundaries),
  });
  return { analysis, graphemes };
};

/** NFC composition and case expansion retain each original grapheme as a single mapping unit. */
export const createAlphabetNormalizer = (alphabet: string) => {
  const supported = new Set(alphabet);
  return (word: string) => {
    const symbols: string[] = [];
    const boundaries: (number | null)[] = [0];

    for (const { index, segment } of segmenter.segment(word)) {
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
