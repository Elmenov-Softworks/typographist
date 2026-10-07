/** Controls which text is preserved without automatic hyphenation. All built-in toggles default to true. */
export type ExclusionOptions = {
  /** Preserves scheme:// URLs, www. spans, and ASCII dot-atom email addresses with dotted hostnames. */
  readonly addresses?: boolean;
  /** Preserves words containing any Unicode number character. */
  readonly numbers?: boolean;
  /** Preserves words containing an underscore. */
  readonly underscores?: boolean;
  /** Preserves words containing an adjacent lowercase-to-uppercase Unicode letter transition. */
  readonly camelCase?: boolean;
  /**
   * Preserves a word when the synchronous predicate returns true. Receives the original word only after built-in
   * exclusions pass; words containing soft hyphens or non-breaking hyphens are always preserved without calling it.
   * Non-boolean results throw TypeError, and predicate errors propagate to the caller.
   */
  readonly custom?: (word: string) => boolean;
};
