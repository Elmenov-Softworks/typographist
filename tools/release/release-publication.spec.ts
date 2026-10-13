import record from '../../.release/latest.json' with { type: 'json' };
import { runGit } from './command.util.ts';
import { buildPackages } from './release-packages.ts';
import { publishRecord } from './release-publication.ts';
import { parseRecord } from './release-record.util.ts';
import { projects } from './release.constants.ts';

const { publish } = vi.hoisted(() => ({ publish: vi.fn() }));

vi.mock('nx/release', () => ({
  ReleaseClient: class {
    releasePublish = publish;
  },
}));
vi.mock('./command.util.ts', () => ({ runCommand: vi.fn(), runGit: vi.fn() }));
vi.mock('./release-packages.ts', () => ({ buildPackages: vi.fn() }));

describe('release submission', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(runGit)
      .mockReturnValueOnce('tag-commit')
      .mockReturnValueOnce(JSON.stringify(record))
      .mockReturnValueOnce(record.source);
    vi.mocked(buildPackages).mockReturnValue(
      projects.map((project) => {
        const pkg = record.packages.find((pkg) => pkg.project === project);

        if (pkg === undefined) throw new Error(`Missing test package ${project}.`);

        return { ...pkg, project };
      }),
    );
    publish.mockResolvedValue({ typographist: { code: 0 }, 'typographist-vue': { code: 0 } });
    vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('accepts successful submissions without requiring immediate registry visibility', async () => {
    const fetchRegistry = vi.fn<typeof fetch>().mockResolvedValue(new Response(null, { status: 404 }));
    vi.stubGlobal('fetch', fetchRegistry);

    await expect(publishRecord(parseRecord(record), ['typographist', 'typographist-vue'])).resolves.toBeUndefined();

    expect(publish).toHaveBeenCalledTimes(2);
    expect(fetchRegistry).not.toHaveBeenCalled();
    expect(console.log).toHaveBeenCalledWith(
      'npm validation may still be pending. Registry integrity will be checked on subsequent runs.',
    );
  });

  it('stops on a failed submission so the recorded version can be resumed', async () => {
    publish.mockResolvedValue({ typographist: { code: 1 } });

    await expect(publishRecord(parseRecord(record), ['typographist', 'typographist-vue'])).rejects.toThrow(
      'Publication failed for typographist; rerun to resume this version.',
    );
    expect(publish).toHaveBeenCalledTimes(1);
  });

  it('rejects changed build artifacts before publishing', async () => {
    vi.mocked(buildPackages).mockReturnValue([]);

    await expect(publishRecord(parseRecord(record), ['typographist'])).rejects.toThrow(
      'Rebuilt artifacts differ from the recorded release.',
    );
    expect(publish).not.toHaveBeenCalled();
  });
});
