import type { CompiledRules } from '@/rules/compiled-rules.types.js';
import type { KhristovRules } from '@/algorithms/khristov/khristov-rules.types.js';

/** Paired datasets for declarative hyphenation rules; both algorithms require their own data. */
export type RuleSets<TLocale extends string = string> = {
  /** Knuth–Liang rules used in standard mode. */
  readonly standard: CompiledRules<TLocale>;
  /** Khristov rules used in fast mode. */
  readonly fast: KhristovRules<TLocale>;
};
