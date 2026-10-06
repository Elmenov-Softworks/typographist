import type { WordNormalizer } from './word-analysis.types.js';

export type HyphenationException = {
  readonly word: string;
  readonly positions: readonly number[];
};

export type LanguageProfile = {
  readonly id: string;
  readonly normalize: WordNormalizer;
  readonly leftMin: number;
  readonly rightMin: number;
  readonly exceptions?: readonly HyphenationException[];
};
