import type { CompiledRules } from '@/rules/compiled-rules.types.js';

import type { KhristovRules } from '@/algorithms/khristov/khristov-rules.types.js';

export interface ITypographistRules<TLocale extends string = string> {
  compile: (useFast: boolean) => CompiledRules<TLocale> | KhristovRules<TLocale>;
}
