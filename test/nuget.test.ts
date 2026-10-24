import { describe, expect, it, vi } from 'vitest';
import { fetchPackages, isPrerelease, NUGET_OWNER, toPackage, type SearchResult } from '../src/lib/nuget';

const result = (overrides: Partial<SearchResult> = {}): SearchResult => ({
  id: 'Acme.Core',
  version: '2.0.0-beta.1',
  description: '  Core library.  ',
  projectUrl: '',
  tags: ['a', ''],
  totalDownloads: 42,
  verified: true,
  packageTypes: [{ name: 'DotnetTool' }],
  versions: [
    { version: '1.0.0', downloads: 30 },
    { version: '1.1.0', downloads: 10 },
    { version: '2.0.0-beta.1', downloads: 2 },
  ],
  ...overrides,
});

const jsonResponse = (body: unknown) => new Response(JSON.stringify(body), { status: 200 });

describe('toPackage', () => {
  it('toPackage_NormalisesSearchResult', () => {
    // Act
    const pkg = toPackage(result());

    // Assert
    expect(pkg).toMatchObject({
      id: 'Acme.Core',
      version: '2.0.0-beta.1',
      stableVersion: '1.1.0',
      description: 'Core library.',
      projectUrl: undefined,
      tags: ['a'],
      totalDownloads: 42,
      type: 'DotnetTool',
    });
    expect(pkg.versions.map((v) => v.version)).toEqual(['2.0.0-beta.1', '1.1.0', '1.0.0']);
  });

  it('toPackage_DefaultsMissingFields', () => {
    // Act
    const pkg = toPackage({ id: 'Bare', version: '0.1.0-alpha' });

    // Assert
    expect(pkg).toMatchObject({
      description: '',
      tags: [],
      totalDownloads: 0,
      verified: false,
      type: 'Dependency',
      versions: [],
      stableVersion: undefined,
    });
  });

  it('isPrerelease_DetectsSemVerSuffix', () => {
    expect(isPrerelease('1.0.0')).toBe(false);
    expect(isPrerelease('1.0.0-rc.1')).toBe(true);
  });
});

describe('fetchPackages', () => {
  it('fetchPackages_QueriesOwnerIncludingPrereleases', async () => {
    // Arrange
    const fetchImpl = vi.fn(async () => jsonResponse({ totalHits: 1, data: [result()] }));

    // Act
    const packages = await fetchPackages(fetchImpl as unknown as typeof fetch);

    // Assert
    expect(packages).toHaveLength(1);
    const url = new URL(String((fetchImpl.mock.calls[0] as unknown[])[0]));
    expect(url.searchParams.get('q')).toBe(`owner:${NUGET_OWNER}`);
    expect(url.searchParams.get('prerelease')).toBe('true');
    expect(url.searchParams.get('semVerLevel')).toBe('2.0.0');
  });

  it('fetchPackages_PagesUntilTotalHitsReached', async () => {
    // Arrange
    const pages = [
      { totalHits: 1001, data: Array.from({ length: 1000 }, (_, i) => result({ id: `P${i}` })) },
      { totalHits: 1001, data: [result({ id: 'Last' })] },
    ];
    const fetchImpl = vi.fn(async () => jsonResponse(pages.shift()));

    // Act
    const packages = await fetchPackages(fetchImpl as unknown as typeof fetch);

    // Assert
    expect(fetchImpl).toHaveBeenCalledTimes(2);
    expect(packages.at(-1)?.id).toBe('Last');
  });

  it('fetchPackages_StopsOnEmptyPage', async () => {
    // Arrange
    const fetchImpl = vi.fn(async () => jsonResponse({ totalHits: 5000, data: [] }));

    // Act
    const packages = await fetchPackages(fetchImpl as unknown as typeof fetch);

    // Assert
    expect(packages).toEqual([]);
    expect(fetchImpl).toHaveBeenCalledTimes(1);
  });

  it('fetchPackages_ThrowsOnHttpError', async () => {
    // Arrange
    const fetchImpl = vi.fn(async () => new Response('nope', { status: 503, statusText: 'Service Unavailable' }));

    // Act / Assert
    await expect(fetchPackages(fetchImpl as unknown as typeof fetch)).rejects.toThrow(
      'NuGet search failed: 503 Service Unavailable',
    );
  });
});
