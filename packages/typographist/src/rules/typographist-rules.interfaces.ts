import type { CompiledRules } from '@/rules/compiled-rules.types.js';

export interface ITypographistRules<TLocale extends string = string> {
  compile: (useFast: boolean) => CompiledRules<TLocale>;
}
