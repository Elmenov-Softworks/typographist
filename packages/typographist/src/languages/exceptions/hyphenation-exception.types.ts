/** Explicit breaks for a word, matched through the language normalizer instead of algorithm patterns. */
export type HyphenationException = {
  /** Original spelling used to prepare the normalized lookup key and map break offsets. */
  readonly word: string;
  /** Increasing interior UTF-16 offsets at original grapheme boundaries; an empty array forbids breaks. */
  readonly positions: readonly number[];
};
