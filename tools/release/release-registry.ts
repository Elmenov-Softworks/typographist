import type { ReleaseRecord } from './release.types.ts';

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

export const findUnpublishedProjects = async (record: ReleaseRecord) => {
  const unpublishedProjects = await Promise.all(
    record.packages.map(async (pkg) => {
      const response = await fetch(`https://registry.npmjs.org/${encodeURIComponent(pkg.name)}/${record.version}`);
      const body: unknown = response.status === 200 ? await response.json() : null;
      const integrity = readRegistryIntegrity(response.status, body);

      if (integrity === null) {
        return pkg.project;
      }

      if (integrity !== pkg.integrity) {
        throw new Error(`Registry integrity differs for ${pkg.name}@${record.version}.`);
      }

      return null;
    }),
  );

  return unpublishedProjects.filter((project) => project !== null);
};
