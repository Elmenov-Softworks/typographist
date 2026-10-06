import type { LanguageProfile } from '../../languages/language-profile.types.js';

export type KnuthLiangPlugin = LanguageProfile & {
  readonly patterns: readonly string[];
};
