/** Locale data returned by a rule plugin and validated when registered with Typographist. */
export type CompiledRules<TLocale extends string = string> = {
  /** Registration key, matched case-insensitively without region fallback. */
  readonly locale: TLocale;
  /** Nonempty set of supported Unicode code points after word normalization to NFC and lowercase. */
  readonly alphabet: string;
  /** Minimum original graphemes before a break; must be a positive safe integer. */
  readonly leftMin: number;
  /** Minimum original graphemes after a break; must be a positive safe integer. */
  readonly rightMin: number;
  /** Knuth–Liang patterns with single-digit weights and optional leading or trailing '.' word anchors. */
  readonly patterns: readonly string[];
  /** Exceptions that take precedence over patterns, with the same grapheme minima applied. */
  readonly exceptions?: readonly {
    /** Supported spelling, matched after NFC normalization and lowercasing. */
    readonly word: string;
    /** Strictly increasing UTF-16 offsets at grapheme boundaries inside word; an empty array prevents breaks. */
    readonly positions: readonly number[];
  }[];
};
