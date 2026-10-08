/** Shared locale data validated when rules are registered with Typographist. */
export type LanguageRules<TLocale extends string = string> = {
  /** Registration key, matched case-insensitively without region fallback. */
  readonly locale: TLocale;
  /** Nonempty set of supported Unicode code points after word normalization to NFC and lowercase. */
  readonly alphabet: string;
  /** Minimum original graphemes before a break; must be a positive safe integer. */
  readonly leftMin: number;
  /** Minimum original graphemes after a break; must be a positive safe integer. */
  readonly rightMin: number;
  /** Exceptions that take precedence over algorithm suggestions, with the same grapheme minima applied. */
  readonly exceptions?: readonly {
    /** Supported spelling, matched after NFC normalization and lowercasing. */
    readonly word: string;
    /** Strictly increasing UTF-16 offsets at grapheme boundaries inside word; an empty array prevents breaks. */
    readonly positions: readonly number[];
  }[];
};
