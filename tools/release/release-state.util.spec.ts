import { chooseAction, needsLatestRun } from './release-state.util.ts';

const source = 'a'.repeat(40);
const releaseCommit = 'b'.repeat(40);
const base = { checksPassed: true, source, remoteHead: source, releaseCommit: null, missing: [] };

describe('release recovery decisions', () => {
  it('prepares the first checked source', () => {
    expect(chooseAction(base)).toBe('prepare');
  });

  it('does not publish after failed checks', () => {
    expect(chooseAction({ ...base, checksPassed: false })).toBe('blocked');
  });

  it('does not prepare stale source', () => {
    expect(chooseAction({ ...base, remoteHead: releaseCommit })).toBe('stale');
  });

  it('verifies a bot release commit without making another patch', () => {
    expect(chooseAction({ ...base, source: releaseCommit, remoteHead: releaseCommit, releaseCommit })).toBe('complete');
  });

  it('resumes partial publication at the recorded version', () => {
    expect(chooseAction({ ...base, releaseCommit, missing: ['typographist-vue'] })).toBe('resume');
  });

  it('resumes an older incomplete release before newer source', () => {
    expect(chooseAction({ ...base, releaseCommit, remoteHead: 'c'.repeat(40), missing: ['typographist-solid'] })).toBe(
      'resume',
    );
  });
});

it('completes original-source retries and requests a rerun only for newer source', () => {
  expect(needsLatestRun(source, releaseCommit, source)).toBe(false);
  expect(needsLatestRun(releaseCommit, releaseCommit, source)).toBe(false);
  expect(needsLatestRun('c'.repeat(40), releaseCommit, source)).toBe(true);
});
