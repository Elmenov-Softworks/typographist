import type { ReleaseRecord } from './release.types.ts';

export const projects = ['typographist', 'typographist-vue', 'typographist-react', 'typographist-solid'] as const;

export const parseRequest = (value: unknown) => {
  if (
    typeof value !== 'object' ||
    value === null ||
    !('type' in value) ||
    (value.type !== 'minor' && value.type !== 'major') ||
    Object.keys(value).length !== 1
  ) {
    throw new Error('Release request must contain only type: minor or major.');
  }

  return value.type;
};

export const parseRecord = (value: unknown) => {
  if (
    typeof value !== 'object' ||
    value === null ||
    !('source' in value) ||
    typeof value.source !== 'string' ||
    !/^[a-f0-9]{40}$/.test(value.source) ||
    !('previousVersion' in value) ||
    (value.previousVersion !== null && typeof value.previousVersion !== 'string') ||
    !('version' in value) ||
    typeof value.version !== 'string' ||
    !/^\d+\.\d+\.\d+$/.test(value.version) ||
    !('request' in value) ||
    (value.request !== null && value.request !== 'minor' && value.request !== 'major') ||
    !('packages' in value) ||
    !Array.isArray(value.packages)
  ) {
    throw new Error('Invalid durable release record.');
  }

  const packages = value.packages.map((item: unknown) => {
    if (
      typeof item !== 'object' ||
      item === null ||
      !('project' in item) ||
      typeof item.project !== 'string' ||
      !('name' in item) ||
      typeof item.name !== 'string' ||
      !('integrity' in item) ||
      typeof item.integrity !== 'string'
    ) {
      throw new Error('Invalid recorded package.');
    }

    return { project: item.project, name: item.name, integrity: item.integrity };
  });

  if (
    packages.length !== projects.length ||
    projects.some(
      (project, index) =>
        packages[index]?.project !== project || packages[index].name !== `@elmenov-softworks/${project}`,
    )
  ) {
    throw new Error('Recorded release group differs from the configured group.');
  }

  const record: ReleaseRecord = {
    source: value.source,
    previousVersion: value.previousVersion,
    version: value.version,
    request: value.request,
    packages,
  };

  return record;
};

export const chooseAction = (state: {
  checksPassed: boolean;
  source: string;
  remoteHead: string;
  releaseCommit: string | null;
  missing: string[];
}) => {
  if (!state.checksPassed) return 'blocked';
  if (state.releaseCommit !== null && state.missing.length > 0) return 'resume';
  if (state.source !== state.remoteHead) return 'stale';
  if (state.source === state.releaseCommit) return 'complete';

  return 'prepare';
};

export const readRegistryIntegrity = (status: number, value: unknown) => {
  if (status === 404) return null;
  if (status !== 200) throw new Error(`npm registry returned HTTP ${String(status)}.`);
  if (
    typeof value !== 'object' ||
    value === null ||
    !('dist' in value) ||
    typeof value.dist !== 'object' ||
    value.dist === null ||
    !('integrity' in value.dist) ||
    typeof value.dist.integrity !== 'string'
  ) {
    throw new Error('npm registry response has no package integrity.');
  }

  return value.dist.integrity;
};

export const needsLatestRun = (source: string, releaseCommit: string, releasedSource: string) =>
  source !== releaseCommit && source !== releasedSource;
