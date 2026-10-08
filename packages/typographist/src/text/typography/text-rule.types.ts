/** Independently selectable formatting capabilities. Hyphenation runs after text rules. */
export type FormattingCategory = 'quotes' | 'dashes' | 'punctuation' | 'spacing' | 'nonbreakingSpacing' | 'hyphenation';

/** Primitive settings declared and validated by each rule during preparation. */
export type TextRuleSettings = Readonly<Record<string, string | number | boolean>>;

/** Original boundaries of an unprotected segment. */
export type TextRuleContext = {
  /** Whether the segment originally began at a line boundary. */
  readonly startsLine: boolean;
  /** Original adjacent characters across protected boundaries; empty at complete-text edges. */
  readonly precedingCharacter?: string;
  /** Original character after the segment across a protected boundary; empty at the text end. */
  readonly followingCharacter?: string;
  /** Original adjoining lexical/numeric runs, including letters, marks, digits, soft hyphens, _, +, -, ., comma and /. */
  readonly precedingToken?: string;
  /** Original lexical/numeric continuation after the segment across a protected boundary. */
  readonly followingToken?: string;
  /** Omitted by legacy callers; treated as a complete-text boundary by bundled trimming rules. */
  readonly startsText?: boolean;
  /** Omitted by legacy callers; treated as a complete-text boundary by bundled trimming rules. */
  readonly endsText?: boolean;
};

/** Synchronous transformation of an unprotected segment. Omitted context denotes a complete text. */
export type TextRuleHandler = (text: string, context?: TextRuleContext) => string;

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
