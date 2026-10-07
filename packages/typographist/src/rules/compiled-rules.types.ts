/** Declarative plugin output; runtime matchers and text processors belong to the library. */
export type CompiledRules<TLocale extends string = string> = {
  readonly locale: TLocale;
  readonly alphabet: string;
  readonly leftMin: number;
  readonly rightMin: number;
  readonly patterns: readonly string[];
  /** Increasing UTF-16 offsets; an empty array prevents hyphenation of this word. */
  readonly exceptions?: readonly { readonly word: string; readonly positions: readonly number[] }[];
};
