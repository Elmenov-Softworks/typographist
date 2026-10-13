import initialPublication from '../../.release/initial-publication.json' with { type: 'json' };
import type { ReleaseRecord } from './release.types.ts';

// The manually published 0.1.0 archives differ from the immutable release tag.
export const registryPackages = (record: ReleaseRecord) =>
  JSON.stringify(record) === JSON.stringify(initialPublication.recorded)
    ? initialPublication.published
    : record.packages;
