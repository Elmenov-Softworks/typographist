import {
  chooseAction,
  needsLatestRun,
  parseRecord,
  parseRequest,
  projects,
  readRegistryIntegrity,
} from './release-state.ts';

const source = 'a'.repeat(40);
const releaseCommit = 'b'.repeat(40);
const base = { checksPassed: true, source, remoteHead: source, releaseCommit: null, missing: [] };

describe('release recovery decisions', () => {
  it('prepares the first checked source', () => {
    expect(chooseAction(base)).toBe('prepare');
  });

  it.each(['minor', 'major'])('accepts an explicit %s request', (type) => {
    expect(parseRequest({ type })).toBe(type);
  });

  it('rejects unspecified bump policies and extra request properties', () => {
    expect(() => parseRequest({ type: 'patch' })).toThrow();
    expect(() => parseRequest({ type: 'minor', repeat: true })).toThrow();
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

  it('recognizes only registry 404 as missing', () => {
    expect(readRegistryIntegrity(404, null)).toBeNull();
    expect(readRegistryIntegrity(200, { dist: { integrity: 'sha512-example' } })).toBe('sha512-example');
    for (const status of [401, 403, 429, 500]) expect(() => readRegistryIntegrity(status, null)).toThrow();
    expect(() => readRegistryIntegrity(200, {})).toThrow();
  });

  it('preserves the release snapshot and rejects changed group membership', () => {
    const record = {
      source,
      previousVersion: '0.1.0',
      version: '0.2.0',
      request: 'minor',
      packages: projects.map((project) => ({
        project,
        name: `@elmenov-softworks/${project}`,
        integrity: 'sha512-example',
      })),
    };
    expect(parseRecord(record)).toEqual(record);
    expect(() => parseRecord({ ...record, packages: record.packages.slice(1) })).toThrow();
  });
});

it('completes original-source retries and requests a rerun only for newer source', () => {
  expect(needsLatestRun(source, releaseCommit, source)).toBe(false);
  expect(needsLatestRun(releaseCommit, releaseCommit, source)).toBe(false);
  expect(needsLatestRun('c'.repeat(40), releaseCommit, source)).toBe(true);
});
