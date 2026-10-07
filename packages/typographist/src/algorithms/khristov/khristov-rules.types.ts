import type { CompiledRules } from '@/rules/compiled-rules.types.js';

export type KhristovRules<TLocale extends string = string> = Omit<CompiledRules<TLocale>, 'patterns'> & {
  readonly vowels: string;
  readonly consonants: string;
  readonly specialLetters: string;
};
