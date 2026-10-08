export type BenchmarkLocale = 'en' | 'ru';
export type TextFormatter = (text: string, locale: BenchmarkLocale) => string;

export type BenchmarkImplementation = {
  readonly id: string;
  readonly algorithm: string;
  readonly useFast: boolean | null;
  readonly create: () => TextFormatter;
};

export type Workload = {
  readonly name: string;
  readonly text: string;
  readonly locale: BenchmarkLocale;
};

export type Timing = {
  readonly minMs: number;
  readonly medianMs: number;
  readonly maxMs: number;
  readonly samplesMs: readonly number[];
};

export type ProcessingResult = Timing & {
  readonly name: string;
  readonly locale: BenchmarkLocale;
  readonly inputUtf16: number;
  readonly outputUtf16: number;
  readonly inputSha256: string;
  readonly iterations: number;
  readonly millionUtf16PerSecond: number;
  readonly validation?: {
    readonly sourcePreserved: boolean;
    readonly idempotent: boolean;
    readonly graphemeSafe: boolean | null;
  };
};

export type ImplementationResult = {
  readonly id: string;
  readonly algorithm: string;
  readonly useFast: boolean | null;
  readonly preparation: Timing;
  readonly processing: readonly ProcessingResult[];
  readonly consumedLength: number;
  readonly version?: string;
  readonly notes?: string;
  readonly skippedWorkloads?: readonly { name: string; locale: BenchmarkLocale; reason: string }[];
};

export type ExternalImplementation = {
  readonly id: string;
  readonly version: string;
  readonly algorithm: string;
  readonly notes: string;
  readonly prepare: () => (() => TextFormatter) | Promise<() => TextFormatter>;
};

export type BenchmarkReport = {
  readonly implementationCommit: string;
  readonly workingTreeDirty: boolean;
  readonly legacyModule: string | null;
  readonly legacyCommit: string | null;
  readonly createdAt: string;
  readonly node: string;
  readonly icu: string | null;
  readonly os: string;
  readonly cpu: string | null;
  readonly sampleCount: number;
  readonly warmupIterations: number;
  readonly implementations: readonly ImplementationResult[];
  readonly externalComparison?: {
    readonly createdAt: string;
    readonly node: string;
    readonly icu: string | null;
    readonly os: string;
    readonly cpu: string | null;
    readonly implementationCommit: string;
    readonly workingTreeDirty: boolean;
    readonly sourceReportSha256: string;
  };
};
