import { describe, expect, it, vi } from 'vitest';
import {
  downloadWindows,
  fetchNpmPackages,
  NPM_MAINTAINER,
  repositoryUrl,
  toNpmPackage,
  type Packument,
} from '../src/lib/npm';

const packument = (overrides: Partial<Packument> = {}): Packument => ({
  name: '@acme/core',
  description: 'Package-level description.',
  'dist-tags': { latest: '1.1.0', beta: '1.2.0-beta.1' },
  versions: {
    '1.0.0': {},
    '1.1.0': {
      description: '  Core plugin.  ',
      keywords: ['scalar', ''],
      repository: { url: 'git+https://github.com/acme/Core.git' },
      homepage: 'https://github.com/acme/Core#readme',
    },
    '1.2.0-beta.1': {},
  },
  time: {
    created: '2026-01-01T00:00:00.000Z',
    modified: '2026-03-01T00:00:00.000Z',
    '1.0.0': '2026-01-01T00:00:00.000Z',
    '1.1.0': '2026-02-01T00:00:00.000Z',
    '1.2.0-beta.1': '2026-03-01T00:00:00.000Z',
  },
  ...overrides,
});

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status });

/** Fake `fetch` answering search, registry and downloads requests from the given tables. */
function fakeNpm(options: {
  search?: () => Response;
  documents?: Record<string, Packument | number>;
  downloads?: (name: string, range: string) => Response;
}) {
  return vi.fn(async (input: string | URL) => {
    const url = String(input);
    if (url.includes('/-/v1/search')) return options.search!();
    const downloads = url.match(/downloads\/point\/([^/]+)\/(.+)$/);
    if (downloads) return options.downloads!(downloads[2]!, downloads[1]!);
    const name = decodeURIComponent(url.replace('https://registry.npmjs.org/', ''));
    const doc = options.documents![name];
    return typeof doc === 'number' ? new Response('', { status: doc }) : json(doc);
  });
}

const searchOf = (...names: string[]) => () => json({ total: names.length, objects: names.map((name) => ({ package: { name } })) });

describe('repositoryUrl', () => {
  it.each([
    ['git+https://github.com/acme/core.git', 'https://github.com/acme/core'],
    ['git://github.com/acme/core.git', 'https://github.com/acme/core'],
    ['git+ssh://git@github.com/acme/core.git', 'https://github.com/acme/core'],
    ['git@github.com:acme/core.git', 'https://github.com/acme/core'],
    ['github:acme/core', 'https://github.com/acme/core'],
    ['acme/core', 'https://github.com/acme/core'],
    ['https://gitlab.com/acme/core', 'https://gitlab.com/acme/core'],
  ])('repositoryUrl_%s_Returns%s', (raw, expected) => {
    expect(repositoryUrl(raw)).toBe(expected);
    expect(repositoryUrl({ url: raw })).toBe(expected);
  });

  it('repositoryUrl_ReturnsUndefinedWhenMissing', () => {
    expect(repositoryUrl(undefined)).toBeUndefined();
    expect(repositoryUrl({})).toBeUndefined();
    expect(repositoryUrl('  ')).toBeUndefined();
  });
});

describe('toNpmPackage', () => {
  it('toNpmPackage_NormalisesFromLatestManifest', () => {
    // Act
    const pkg = toNpmPackage(packument(), 99);

    // Assert
    expect(pkg).toMatchObject({
      registry: 'npm',
      id: '@acme/core',
      version: '1.2.0-beta.1',
      stableVersion: '1.1.0',
      description: 'Core plugin.',
      projectUrl: 'https://github.com/acme/Core',
      tags: ['scalar'],
      totalDownloads: 99,
      verified: false,
      type: 'Dependency',
      deprecation: undefined,
    });
    expect(pkg!.versions).toEqual([{ version: '1.2.0-beta.1' }, { version: '1.1.0' }, { version: '1.0.0' }]);
  });

  it('toNpmPackage_FallsBackToPackageLevelFields', () => {
    // Arrange
    const doc = packument({
      'dist-tags': { latest: '9.9.9' },
      versions: { '0.1.0-alpha': {} },
      time: { '0.1.0-alpha': '2026-01-01T00:00:00.000Z' },
      keywords: ['pkg'],
      homepage: 'https://acme.dev',
    });

    // Act
    const pkg = toNpmPackage(doc, 0);

    // Assert
    expect(pkg).toMatchObject({
      version: '0.1.0-alpha',
      stableVersion: undefined,
      description: 'Package-level description.',
      projectUrl: 'https://acme.dev',
      tags: ['pkg'],
    });
  });

  it('toNpmPackage_MapsDeprecationMessage', () => {
    // Arrange
    const doc = packument({ versions: { '1.1.0': { deprecated: 'Use @acme/next' } }, time: {} });

    // Act / Assert
    expect(toNpmPackage(doc, 0)!.deprecation).toEqual({ reasons: [], message: 'Use @acme/next' });
  });

  it('toNpmPackage_ReturnsUndefinedWithoutVersions', () => {
    expect(toNpmPackage({ name: '@acme/gone', time: { unpublished: '2026-01-01' } }, 0)).toBeUndefined();
  });
});

describe('downloadWindows', () => {
  it('downloadWindows_SplitsIntoYearlyInclusiveRanges', () => {
    // Act
    const windows = downloadWindows('2024-03-10T12:00:00.000Z', new Date('2026-03-20T08:00:00Z'));

    // Assert
    expect(windows).toEqual([
      ['2024-03-10', '2025-03-09'],
      ['2025-03-10', '2026-03-09'],
      ['2026-03-10', '2026-03-20'],
    ]);
  });

  it('downloadWindows_ClampsToFirstDayWithData', () => {
    expect(downloadWindows('2010-01-01T00:00:00.000Z', new Date('2015-01-12T00:00:00Z'))).toEqual([
      ['2015-01-10', '2015-01-12'],
    ]);
    expect(downloadWindows(undefined, new Date('2015-01-10T00:00:00Z'))).toEqual([['2015-01-10', '2015-01-10']]);
  });
});

describe('fetchNpmPackages', () => {
  const now = new Date('2026-11-19T00:00:00Z');

  it('fetchNpmPackages_SearchesMaintainerAndSumsDownloads', async () => {
    // Arrange
    const fetchImpl = fakeNpm({
      search: searchOf('@acme/core'),
      documents: { '@acme/core': packument({ time: { ...packument().time, created: '2025-06-01T00:00:00.000Z' } }) },
      downloads: (_name, range) => json({ downloads: range.startsWith('2025') ? 100 : 5 }),
    });

    // Act
    const packages = await fetchNpmPackages(fetchImpl as unknown as typeof fetch, now);

    // Assert
    expect(packages).toHaveLength(1);
    expect(packages[0]!.totalDownloads).toBe(105);
    const search = new URL(String(fetchImpl.mock.calls[0]![0]));
    expect(search.searchParams.get('text')).toBe(`maintainer:${NPM_MAINTAINER}`);
    expect(fetchImpl.mock.calls.map((c) => String(c[0]))).toContain('https://registry.npmjs.org/@acme%2Fcore');
  });

  it('fetchNpmPackages_TreatsMissingDownloadsAndDocumentsAsEmpty', async () => {
    // Arrange
    const fetchImpl = fakeNpm({
      search: searchOf('@acme/core', '@acme/gone', '@acme/core'),
      documents: { '@acme/core': packument(), '@acme/gone': 404 },
      downloads: () => json({ error: 'not found' }, 404),
    });

    // Act
    const packages = await fetchNpmPackages(fetchImpl as unknown as typeof fetch, now);

    // Assert
    expect(packages.map((p) => p.id)).toEqual(['@acme/core']);
    expect(packages[0]!.totalDownloads).toBe(0);
  });

  it('fetchNpmPackages_StopsOnEmptyPage', async () => {
    // Arrange
    const fetchImpl = fakeNpm({ search: () => json({ total: 500, objects: [] }) });

    // Act
    const packages = await fetchNpmPackages(fetchImpl as unknown as typeof fetch, now);

    // Assert
    expect(packages).toEqual([]);
    expect(fetchImpl).toHaveBeenCalledTimes(1);
  });

  it('fetchNpmPackages_ThrowsOnSearchError', async () => {
    const fetchImpl = fakeNpm({ search: () => new Response('', { status: 503, statusText: 'Service Unavailable' }) });
    await expect(fetchNpmPackages(fetchImpl as unknown as typeof fetch, now)).rejects.toThrow(
      'npm search failed: 503 Service Unavailable',
    );
  });

  it('fetchNpmPackages_ThrowsOnRegistryError', async () => {
    const fetchImpl = fakeNpm({ search: searchOf('@acme/core'), documents: { '@acme/core': 500 } });
    await expect(fetchNpmPackages(fetchImpl as unknown as typeof fetch, now)).rejects.toThrow(
      'npm registry failed for @acme/core: 500',
    );
  });

  it('fetchNpmPackages_ThrowsOnDownloadsError', async () => {
    const fetchImpl = fakeNpm({
      search: searchOf('@acme/core'),
      documents: { '@acme/core': packument() },
      downloads: () => new Response('', { status: 429, statusText: 'Too Many Requests' }),
    });
    await expect(fetchNpmPackages(fetchImpl as unknown as typeof fetch, now)).rejects.toThrow(
      'npm downloads failed for @acme/core: 429 Too Many Requests',
    );
  });
});
