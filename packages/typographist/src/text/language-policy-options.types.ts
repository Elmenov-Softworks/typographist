import type { HyphenationException } from '../languages/language-profile.types.js';

export type LanguagePolicyOptions = {
  readonly leftMin?: number;
  readonly rightMin?: number;
  readonly minWordLength?: number;
  readonly exceptions?: readonly HyphenationException[];
};
