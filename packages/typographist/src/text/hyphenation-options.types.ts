import type { PreparedAlgorithm } from '../algorithms/prepared-algorithm.types.js';
import type { ExclusionOptions } from './exclusion-options.types.js';
import type { LanguagePolicyOptions } from './language-policy-options.types.js';

export type HyphenationOptions = {
  readonly algorithm: PreparedAlgorithm;
  readonly defaultLanguage: string;
  readonly wordSelector?: (word: string, language: string) => string | null;
  readonly languages?: Readonly<Record<string, LanguagePolicyOptions>>;
  readonly exclusions?: ExclusionOptions;
};

export type HyphenationCallOptions = {
  readonly language?: string;
};
