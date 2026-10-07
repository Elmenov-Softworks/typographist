import type { PreparedAlgorithm } from '@/algorithms/prepared-algorithm.types.js';
import type { prepareExclusions } from '@/text/exclusions/prepare-exclusions.util.js';

export type TextFormattingContext = {
  readonly algorithm: PreparedAlgorithm;
  readonly exclusions: ReturnType<typeof prepareExclusions>;
};
