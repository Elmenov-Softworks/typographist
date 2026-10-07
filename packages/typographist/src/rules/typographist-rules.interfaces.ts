import type { CompiledRules } from '@/rules/compiled-rules.types.js';

import type { KhristovRules } from '@/algorithms/khristov/khristov-rules.types.js';

/** Contract for rule plugins that supply locale data for the selected hyphenation algorithm. */
export interface ITypographistRules<TLocale extends string = string> {
  /** Supplies Khristov data when true and Knuth–Liang data when false, for validation on registration. */
  compile: (useFast: boolean) => CompiledRules<TLocale> | KhristovRules<TLocale>;
}
