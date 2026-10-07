import type { HyphenationException } from '@/languages/exceptions/hyphenation-exception.types.js';
import type { WordAnalysis } from '@/languages/analysis/word-analysis.types.js';
import type { WordNormalizer } from '@/languages/analysis/word-normalizer.types.js';
import { validateWordAnalysis } from '@/languages/analysis/validate-word-analysis.util.js';

/** Stores normalized symbol boundaries, so equivalent spellings never reuse original UTF-16 offsets. */
export const prepareExceptionTable = (entries: readonly HyphenationException[], normalize: WordNormalizer) => {
  if (!Array.isArray(entries)) {
    throw new TypeError('Language exceptions must be an array');
  }

  const table = new Map<string, readonly number[]>();
  const input: readonly unknown[] = entries;

  for (const entry of input) {
    if (
      typeof entry !== 'object' ||
      entry === null ||
      !('word' in entry) ||
      typeof entry.word !== 'string' ||
      !('positions' in entry) ||
      !Array.isArray(entry.positions)
    ) {
      throw new TypeError('Language exception must contain a word and positions array');
    }

    const validated = validateWordAnalysis(entry.word, normalize(entry.word));

    if (validated === null) {
      throw new TypeError('Language exception word is unsupported');
    }

    const { analysis, graphemes } = validated;
    const graphemeSet = new Set(graphemes);
    const mapped = new Map<number, number>();

    for (const [index, offset] of analysis.boundaries.entries()) {
      if (offset !== null) {
        mapped.set(offset, index);
      }
    }

    const positions: number[] = [];
    let previous = 0;

    for (const position of entry.positions) {
      if (typeof position !== 'number') {
        throw new TypeError('Language exception positions must be numbers');
      }

      if (
        !Number.isSafeInteger(position) ||
        position <= previous ||
        position >= entry.word.length ||
        !graphemeSet.has(position)
      ) {
        throw new RangeError('Language exception has an invalid break offset');
      }

      const boundary = mapped.get(position);

      if (boundary === undefined) {
        throw new RangeError('Language exception break has no normalized boundary');
      }

      positions.push(boundary);
      previous = position;
    }

    const key = analysis.symbols.join('');
    const existing = table.get(key);

    if (
      existing !== undefined &&
      (existing.length !== positions.length || existing.some((value, index) => value !== positions[index]))
    ) {
      throw new RangeError('Language exceptions have conflicting normalized keys');
    }

    table.set(key, Object.freeze(positions));
  }

  const lookup = (analysis: WordAnalysis) => {
    const positions = table.get(analysis.symbols.join(''));

    if (positions === undefined) {
      return null;
    }

    const offsets: number[] = [];

    for (const position of positions) {
      const offset = analysis.boundaries[position];

      if (offset !== null && offset !== undefined) {
        offsets.push(offset);
      }
    }

    return offsets;
  };

  return Object.freeze({ lookup });
};
