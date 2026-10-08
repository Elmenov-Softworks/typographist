/** Independently selectable formatting capabilities. Hyphenation runs after text rules. */
export type FormattingCategory = 'quotes' | 'dashes' | 'punctuation' | 'spacing' | 'nonbreakingSpacing' | 'hyphenation';

/** Primitive settings declared and validated by each rule during preparation. */
export type TextRuleSettings = Readonly<Record<string, string | number | boolean>>;

/** Synchronous transformation of an unprotected text segment. */
export type TextRuleHandler = (text: string) => string;

/** Consumer-supplied symbolic typography. Equal order values retain registration order. */
export type TextRule = {
  /** Unique identifier, retaining the upstream ID for adapted reference rules. */
  readonly id: string;
  /** Selectable symbolic capability; hyphenation uses its existing algorithm data. */
  readonly category: Exclude<FormattingCategory, 'hyphenation'>;
  /** Finite processing priority; lower values run first. */
  readonly order: number;
  /** Omission applies the rule to every registered locale. No locale fallback is performed. */
  readonly locales?: readonly string[];
  /** Defaults and allowed setting names. Overrides must have matching primitive types. */
  readonly defaults: TextRuleSettings;
  /** Validates setting ranges and prepares service-owned state once. Throw for invalid settings. */
  readonly prepare: (settings: TextRuleSettings) => TextRuleHandler;
};

/** Preparation options copied before formatting; omitted categories enable every capability. */
export type TextPipelineOptions = {
  /** Explicit selection, including an empty list to disable all text rules. */
  readonly categories?: readonly FormattingCategory[];
  /** Per-rule setting overrides. Unknown IDs or setting names are rejected. */
  readonly settings?: Readonly<Record<string, TextRuleSettings>>;
  /** Nonempty literal text preserved alongside recognized URLs and email addresses. */
  readonly protectedContent?: readonly string[];
};
