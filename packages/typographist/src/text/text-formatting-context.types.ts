import type { PreparedAlgorithm } from '#src/algorithms/prepared-algorithm.types.js';
import type { prepareExclusions } from '#src/text/exclusions/prepare-exclusions.util.js';

export type TextFormattingContext = {
  readonly algorithm: PreparedAlgorithm;
  readonly exclusions: ReturnType<typeof prepareExclusions>;
};
