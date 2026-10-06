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

export const needsLatestRun = (source: string, releaseCommit: string, releasedSource: string) =>
  source !== releaseCommit && source !== releasedSource;
