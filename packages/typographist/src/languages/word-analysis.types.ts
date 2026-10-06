/** Inter-symbol offsets refer to original grapheme boundaries; null marks an unmappable expansion boundary. */
export type WordAnalysis = {
  readonly symbols: readonly string[];
  readonly boundaries: readonly (number | null)[];
};

export type WordNormalizer = (word: string) => WordAnalysis | null;
