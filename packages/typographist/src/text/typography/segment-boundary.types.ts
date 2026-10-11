import type { TextRuleContext } from '#src/text/typography/text-rule.types.js';

export const segmentBoundary = Symbol('segmentBoundary');

export type SegmentBoundaryContext = TextRuleContext & {
  readonly [segmentBoundary]?: {
    readonly original: string;
    readonly end: number;
    readonly quotation: { level: number } | null;
  };
};
