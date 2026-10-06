import { parseRecord, parseRequest } from './release-record.util.ts';
import { projects } from './release.constants.ts';

const source = 'a'.repeat(40);

describe('release record validation', () => {
  it.each(['minor', 'major'])('accepts an explicit %s request', (type) => {
    expect(parseRequest({ type })).toBe(type);
  });

  it('rejects unspecified bump policies and extra request properties', () => {
    expect(() => parseRequest({ type: 'patch' })).toThrow();
    expect(() => parseRequest({ type: 'minor', repeat: true })).toThrow();
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
