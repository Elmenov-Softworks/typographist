export type ReleaseRequest = 'minor' | 'major' | null;

export type ReleaseRecord = {
  source: string;
  previousVersion: string | null;
  version: string;
  request: ReleaseRequest;
  packages: { project: string; name: string; integrity: string }[];
};
