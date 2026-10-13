import initialPublication from '../../.release/initial-publication.json' with { type: 'json' };
import { parseRecord } from './release-record.util.ts';
import { findUnpublishedProjects, readRegistryIntegrity } from './release-registry.ts';

describe('npm registry responses', () => {
  it('recognizes only registry 404 as missing', () => {
    expect(readRegistryIntegrity(404, null)).toBeNull();
    expect(readRegistryIntegrity(200, { dist: { integrity: 'sha512-example' } })).toBe('sha512-example');

    for (const status of [401, 403, 429, 500]) {
      expect(() => readRegistryIntegrity(status, null)).toThrow();
    }

    expect(() => readRegistryIntegrity(200, {})).toThrow();
  });
});

const record = {
  source: 'a'.repeat(40),
  previousVersion: null,
  version: '0.1.0',
  request: null,
  packages: [
    { project: 'typographist', name: '@elmenov-softworks/typographist', integrity: 'sha512-core' },
    { project: 'typographist-vue', name: '@elmenov-softworks/typographist-vue', integrity: 'sha512-vue' },
  ],
};

describe('publication verification', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('returns only missing packages after verifying published artifacts', async () => {
    const fetchRegistry = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(Response.json({ dist: { integrity: 'sha512-core' } }))
      .mockResolvedValueOnce(new Response(null, { status: 404 }));
    vi.stubGlobal('fetch', fetchRegistry);

    const missing = await findUnpublishedProjects(record);

    expect(missing).toEqual(['typographist-vue']);
    expect(fetchRegistry).toHaveBeenCalledWith('https://registry.npmjs.org/%40elmenov-softworks%2Ftypographist/0.1.0');
  });

  it('rejects a published artifact with different integrity', async () => {
    vi.stubGlobal(
      'fetch',
      vi
        .fn<typeof fetch>()
        .mockResolvedValueOnce(Response.json({ dist: { integrity: 'sha512-different' } }))
        .mockResolvedValueOnce(Response.json({ dist: { integrity: 'sha512-different' } })),
    );

    await expect(findUnpublishedProjects(record)).rejects.toThrow('Registry integrity differs');
  });

  it('propagates registry failures without treating them as missing packages', async () => {
    vi.stubGlobal('fetch', vi.fn<typeof fetch>().mockResolvedValue(new Response(null, { status: 503 })));

    await expect(findUnpublishedProjects(record)).rejects.toThrow('HTTP 503');
  });

  it('verifies the separately reconciled manual publication without changing the tagged record', async () => {
    const tagged = parseRecord(initialPublication.recorded);
    const before = JSON.stringify(tagged);
    vi.stubGlobal(
      'fetch',
      vi.fn<typeof fetch>().mockImplementation((url) => {
        const pkg = initialPublication.published.find(
          (pkg) => url === `https://registry.npmjs.org/${encodeURIComponent(pkg.name)}/0.1.0`,
        );

        return Promise.resolve(Response.json({ dist: { integrity: pkg?.integrity } }));
      }),
    );

    await expect(findUnpublishedProjects(tagged)).resolves.toEqual([]);
    expect(JSON.stringify(tagged)).toBe(before);

    for (const changed of [
      { ...tagged, source: 'b'.repeat(40) },
      { ...tagged, packages: tagged.packages.map((pkg) => ({ ...pkg, integrity: 'sha512-changed' })) },
    ]) {
      await expect(findUnpublishedProjects(changed)).rejects.toThrow('Registry integrity differs');
    }

    vi.stubGlobal(
      'fetch',
      vi
        .fn<typeof fetch>()
        .mockImplementation(() =>
          Promise.resolve(Response.json({ dist: { integrity: initialPublication.published[0]?.integrity } })),
        ),
    );
    await expect(findUnpublishedProjects({ ...tagged, version: '1.0.0' })).rejects.toThrow(
      'Registry integrity differs',
    );
  });

  it('still rejects unexpected archive changes in the reconciled initial release', async () => {
    vi.stubGlobal(
      'fetch',
      vi
        .fn<typeof fetch>()
        .mockImplementation(() => Promise.resolve(Response.json({ dist: { integrity: 'sha512-unexpected' } }))),
    );

    await expect(findUnpublishedProjects(parseRecord(initialPublication.recorded))).rejects.toThrow(
      'Registry integrity differs',
    );
  });
});
