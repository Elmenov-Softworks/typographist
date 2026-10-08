import type { CompiledRules } from '@/rules/compiled-rules.types.js';
import type { KhristovRules } from '@/algorithms/khristov/khristov-rules.types.js';

/** Datasets accepted by the default TypographistRules compiler. */
export type RuleSets<TLocale extends string = string> = {
  /** Knuth–Liang rules used in standard mode. */
  readonly standard: CompiledRules<TLocale>;
  /** Khristov rules used in fast mode. */
  readonly fast: KhristovRules<TLocale>;
};
