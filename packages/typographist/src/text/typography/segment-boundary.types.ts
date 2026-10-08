import type { TextRuleContext } from '@/text/typography/text-rule.types.js';

export const segmentBoundary = Symbol('segmentBoundary');

export type SegmentBoundaryContext = TextRuleContext & {
  readonly [segmentBoundary]?: { readonly original: string; readonly end: number };
};
