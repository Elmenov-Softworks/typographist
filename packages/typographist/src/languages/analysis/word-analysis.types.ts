/**
 * Normalized matching symbols with insertion offsets into the original word.
 *
 * @example
 * const analysis: WordAnalysis = {
 *   symbols: ['i', '\u0307'],
 *   boundaries: [0, null, 1],
 * };
 * // Lowercasing İ expands it without creating a break inside the original grapheme.
 */
export type WordAnalysis = {
  /** Each entry is one Unicode code point used for matching. */
  readonly symbols: readonly string[];
  /**
   * Original UTF-16 offsets before, between, and after the symbols, with one more entry than symbols.
   * Non-null entries must cover every original grapheme boundary in order, from zero to the word's length.
   * Null marks a boundary inside a normalized expansion where no original insertion offset exists.
   */
  readonly boundaries: readonly (number | null)[];
};
