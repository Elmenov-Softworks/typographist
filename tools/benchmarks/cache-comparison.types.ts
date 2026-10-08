import type { BenchmarkReport, ImplementationResult, ProcessingResult, Timing } from './benchmark.types.ts';

export type CacheState = 'disabled' | 'empty' | 'warmed';

export type CacheProcessingResult = ProcessingResult & {
  readonly preparation: Timing;
  readonly cacheWarmup: Timing;
  readonly outputEqual: boolean | null;
};

export type CacheImplementationResult = Omit<ImplementationResult, 'processing'> & {
  readonly label: string;
  readonly library: string;
  readonly cacheState: CacheState;
  readonly cacheSizeMiB: number | null;
  readonly processing: readonly CacheProcessingResult[];
};

export type CacheComparisonReport = Omit<BenchmarkReport, 'implementations'> & {
  readonly procedure: string;
  readonly implementations: readonly CacheImplementationResult[];
};
