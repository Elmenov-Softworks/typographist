import type { CompiledRules } from '@/rules/compiled-rules.types.js';

export type RuleSets<TLocale extends string = string> = {
  readonly standard: CompiledRules<TLocale>;
  readonly fast?: CompiledRules<TLocale>;
};
