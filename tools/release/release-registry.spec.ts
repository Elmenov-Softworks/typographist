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
});
