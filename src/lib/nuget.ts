import { isPrerelease, type Package, type PackageDeprecation } from './package';

/** NuGet owner whose packages make up the catalogue. */
export const NUGET_OWNER = 'bielu';

const SEARCH_URL = 'https://azuresearch-usnc.nuget.org/query';
const PAGE_SIZE = 1000;

/** Shape of one `data[]` entry of the NuGet search API (only the fields we read). */
export interface SearchResult {
  id: string;
  version: string;
  description?: string;
  projectUrl?: string;
  iconUrl?: string;
  tags?: string[];
  totalDownloads?: number;
  verified?: boolean;
  packageTypes?: { name: string }[];
  versions?: { version: string; downloads: number }[];
  deprecation?: PackageDeprecation;
}

interface SearchResponse {
  totalHits: number;
  data: SearchResult[];
}

/** Maps a raw NuGet search result onto {@link Package}. */
export function toPackage(result: SearchResult): Package {
  const versions = (result.versions ?? [])
    .map(({ version, downloads }) => ({ version, downloads }))
    .reverse();

  return {
    registry: 'nuget',
    id: result.id,
    version: result.version,
    stableVersion: versions.find((v) => !isPrerelease(v.version))?.version,
    description: result.description?.trim() ?? '',
    projectUrl: result.projectUrl || undefined,
    iconUrl: result.iconUrl || undefined,
    tags: (result.tags ?? []).filter(Boolean),
    totalDownloads: result.totalDownloads ?? 0,
    verified: result.verified ?? false,
    type: result.packageTypes?.[0]?.name ?? 'Dependency',
    versions,
    deprecation: result.deprecation,
  };
}

/**
 * Fetches every package owned by {@link NUGET_OWNER}, prereleases included.
 * Throws on any HTTP failure so a broken build never deploys an empty catalogue.
 */
export async function fetchNugetPackages(fetchImpl: typeof fetch = fetch): Promise<Package[]> {
  const packages: Package[] = [];
  let total = Infinity;

  for (let skip = 0; skip < total; skip += PAGE_SIZE) {
    const url = new URL(SEARCH_URL);
    url.search = new URLSearchParams({
      q: `owner:${NUGET_OWNER}`,
      prerelease: 'true',
      semVerLevel: '2.0.0',
      take: String(PAGE_SIZE),
      skip: String(skip),
    }).toString();

    const response = await fetchImpl(url);
    if (!response.ok) {
      throw new Error(`NuGet search failed: ${response.status} ${response.statusText}`);
    }

    const body = (await response.json()) as SearchResponse;
    total = body.totalHits;
    packages.push(...body.data.map(toPackage));
    if (body.data.length === 0) break;
  }

  return packages;
}
