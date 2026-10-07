import type { CompiledRules } from '@/rules/compiled-rules.types.js';

/** Datasets accepted by the default TypographistRules compiler. */
export type RuleSets<TLocale extends string = string> = {
  /** Rules used in standard mode and as the fallback when fast rules are absent. */
  readonly standard: CompiledRules<TLocale>;
  /** Rules selected when useFast is true; omission falls back to standard. */
  readonly fast?: CompiledRules<TLocale>;
};
