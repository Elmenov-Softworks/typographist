import type { BenchmarkReport, ImplementationResult, ProcessingResult } from './benchmark.types.ts';

const fields = (value: unknown) => {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    throw new TypeError('Expected a benchmark object');
  }

  return new Map<string, unknown>(Object.entries(value));
};

const string = (value: unknown) => {
  if (typeof value !== 'string') throw new TypeError('Expected a benchmark string');
  return value;
};

const nullableString = (value: unknown) => (value === null ? null : string(value));

const number = (value: unknown) => {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < 0) {
    throw new TypeError('Expected a finite nonnegative benchmark number');
  }
  return value;
};

const boolean = (value: unknown) => {
  if (typeof value !== 'boolean') throw new TypeError('Expected a benchmark boolean');
  return value;
};

const array = (value: unknown) => {
  if (!Array.isArray(value)) throw new TypeError('Expected a benchmark array');
  const entries: readonly unknown[] = value;
  return entries;
};

const timing = (value: unknown) => {
  const data = fields(value);
  return {
    minMs: number(data.get('minMs')),
    medianMs: number(data.get('medianMs')),
    maxMs: number(data.get('maxMs')),
    samplesMs: array(data.get('samplesMs')).map(number),
  };
};

const processing = (value: unknown) => {
  const data = fields(value);
  const locale = data.get('locale');

  if (locale !== 'en' && locale !== 'ru') throw new TypeError('Unsupported benchmark locale');

  const result: ProcessingResult = {
    ...timing(value),
    locale,
    name: string(data.get('name')),
    inputUtf16: number(data.get('inputUtf16')),
    outputUtf16: number(data.get('outputUtf16')),
    inputSha256: string(data.get('inputSha256')),
    iterations: number(data.get('iterations')),
    millionUtf16PerSecond: number(data.get('millionUtf16PerSecond')),
  };
  return result;
};

const implementation = (value: unknown) => {
  const data = fields(value);
  const mode = data.get('useFast');
  const result: ImplementationResult = {
    id: string(data.get('id')),
    algorithm: string(data.get('algorithm')),
    useFast: mode === null ? null : boolean(mode),
    preparation: timing(data.get('preparation')),
    processing: array(data.get('processing')).map(processing),
    consumedLength: number(data.get('consumedLength')),
  };
  return result;
};

export const readSavedReport = (source: string) => {
  const input: unknown = JSON.parse(source);
  const data = fields(input);

  if (data.has('externalComparison'))
    throw new TypeError('Use the original report before external measurements were appended');

  const report: BenchmarkReport = {
    implementationCommit: string(data.get('implementationCommit')),
    workingTreeDirty: boolean(data.get('workingTreeDirty')),
    legacyModule: nullableString(data.get('legacyModule')),
    legacyCommit: nullableString(data.get('legacyCommit')),
    createdAt: string(data.get('createdAt')),
    node: string(data.get('node')),
    icu: nullableString(data.get('icu')),
    os: string(data.get('os')),
    cpu: nullableString(data.get('cpu')),
    sampleCount: number(data.get('sampleCount')),
    warmupIterations: number(data.get('warmupIterations')),
    implementations: array(data.get('implementations')).map(implementation),
  };
  return report;
};
