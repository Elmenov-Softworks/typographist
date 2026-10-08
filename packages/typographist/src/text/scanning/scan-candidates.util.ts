import type { CandidateSpan } from '@/text/scanning/candidate-span.types.js';

const candidate =
  /[\p{L}\p{M}\p{N}_\u00ad]+(?:['\u2019\u2011][\p{L}\p{M}\p{N}_\u00ad]+|[\u200c\u200d\p{Cs}]+[\p{L}\p{M}\p{N}_\u00ad]+)*/gu;

export const scanCandidates = (text: string) => {
  const candidates: CandidateSpan[] = [];
  for (const match of text.matchAll(candidate)) {
    candidates.push({ start: match.index, end: match.index + match[0].length });
  }

  return candidates;
};
