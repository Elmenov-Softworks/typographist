import type { WordNormalizer } from '@/languages/analysis/word-normalizer.types.js';

import type { HyphenationException } from '@/languages/exceptions/hyphenation-exception.types.js';

export type LanguageProfile = {
  readonly id: string;
  readonly normalize: WordNormalizer;
  readonly leftMin: number;
  readonly rightMin: number;
  readonly exceptions?: readonly HyphenationException[];
};
