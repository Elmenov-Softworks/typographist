import type { ImplementationResult, ProcessingResult } from './benchmark.types.ts';

export const isComparable = ({ validation }: ProcessingResult) =>
  validation === undefined || (validation.sourcePreserved && validation.idempotent && validation.graphemeSafe === true);

export const relativeSpeed = (result: ProcessingResult, baseline: ImplementationResult | undefined) => {
  const previous = baseline?.processing.find(
    (entry) => entry.name === result.name && entry.locale === result.locale && entry.inputSha256 === result.inputSha256,
  );

  if (previous === undefined || !isComparable(result) || !isComparable(previous) || result.medianMs <= 0) {
    return null;
  }

  return previous.medianMs / result.medianMs;
};
