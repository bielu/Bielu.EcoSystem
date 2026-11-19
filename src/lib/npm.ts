import { isPrerelease, type Package } from './package';

/** npm user whose packages make up the catalogue. */
export const NPM_MAINTAINER = 'bielu';

const REGISTRY_URL = 'https://registry.npmjs.org';
const DOWNLOADS_URL = 'https://api.npmjs.org/downloads/point';
const PAGE_SIZE = 250;
/** First day npm has download counts for. */
const FIRST_DOWNLOAD_DAY = '2015-01-10';
/** The downloads API caps one range at 18 months, so totals are summed over yearly windows. */
const WINDOW_DAYS = 365;
const DAY_MS = 86_400_000;

type Repository = string | { url?: string };

export interface PackumentVersion {
  description?: string;
  keywords?: string[];
  homepage?: string;
  repository?: Repository;
  deprecated?: string;
}

/** Shape of a registry document (`GET /<name>`), only the fields we read. */
export interface Packument {
  name: string;
  description?: string;
  keywords?: string[];
  homepage?: string;
  repository?: Repository;
  'dist-tags'?: Record<string, string>;
  versions?: Record<string, PackumentVersion>;
  /** Publish time per version, plus `created` and `modified`. */
  time?: Record<string, string>;
}

interface SearchResponse {
  total: number;
  objects: { package: { name: string } }[];
}

/** `git+https://github.com/a/b.git`, `git@github.com:a/b.git` or `github:a/b` → `https://github.com/a/b`. */
export function repositoryUrl(repository?: Repository): string | undefined {
  const raw = (typeof repository === 'string' ? repository : repository?.url)?.trim();
  if (!raw) return undefined;
  const shorthand = raw.match(/^(?:github:)?([\w.-]+\/[\w.-]+)$/);
  if (shorthand) return `https://github.com/${shorthand[1]}`;
  return raw
    .replace(/^git\+/, '')
    .replace(/^(?:git|ssh):\/\/(?:git@)?/, 'https://')
    .replace(/^git@([^:/]+):/, 'https://$1/')
    .replace(/\.git$/, '');
}

/**
 * Maps a registry document onto {@link Package}. Versions are ordered by publish time, newest first;
 * the stable version is the `latest` dist-tag when it is stable. Returns `undefined` for a package
 * with no versions left (fully unpublished).
 */
export function toNpmPackage(doc: Packument, totalDownloads: number): Package | undefined {
  const manifests = doc.versions ?? {};
  const time = doc.time ?? {};
  const names = Object.keys(manifests).sort((a, b) => (time[b] ?? '').localeCompare(time[a] ?? ''));
  if (names.length === 0) return undefined;

  const tagged = doc['dist-tags']?.latest;
  const latest = tagged && manifests[tagged] ? tagged : names[0]!;
  const manifest = manifests[latest]!;

  return {
    registry: 'npm',
    id: doc.name,
    version: names[0]!,
    stableVersion: [latest, ...names].find((v) => !isPrerelease(v)),
    description: (manifest.description ?? doc.description ?? '').trim(),
    projectUrl: repositoryUrl(manifest.repository ?? doc.repository) ?? (manifest.homepage || doc.homepage || undefined),
    tags: (manifest.keywords ?? doc.keywords ?? []).filter(Boolean),
    totalDownloads,
    verified: false,
    type: 'Dependency',
    versions: names.map((version) => ({ version })),
    deprecation: manifest.deprecated ? { reasons: [], message: manifest.deprecated } : undefined,
  };
}

/** Consecutive inclusive `[start, end]` day ranges of at most a year, from `created` up to `now`. */
export function downloadWindows(created: string | undefined, now: Date): [start: string, end: string][] {
  const day = (ms: number) => new Date(ms).toISOString().slice(0, 10);
  const first = Date.parse(FIRST_DOWNLOAD_DAY);
  const end = Date.parse(day(now.getTime()));
  let start = Math.max(first, Date.parse((created ?? '').slice(0, 10)) || first);

  const windows: [string, string][] = [];
  for (; start <= end; start += WINDOW_DAYS * DAY_MS) {
    windows.push([day(start), day(Math.min(start + (WINDOW_DAYS - 1) * DAY_MS, end))]);
  }
  return windows;
}

async function fetchTotalDownloads(name: string, created: string | undefined, fetchImpl: typeof fetch, now: Date) {
  let total = 0;
  for (const [start, end] of downloadWindows(created, now)) {
    const response = await fetchImpl(`${DOWNLOADS_URL}/${start}:${end}/${name}`);
    // 404 means npm has no downloads recorded for the package yet.
    if (response.status === 404) continue;
    if (!response.ok) {
      throw new Error(`npm downloads failed for ${name}: ${response.status} ${response.statusText}`);
    }
    total += ((await response.json()) as { downloads?: number }).downloads ?? 0;
  }
  return total;
}

async function searchNames(fetchImpl: typeof fetch): Promise<string[]> {
  const names = new Set<string>();
  let total = Infinity;

  for (let from = 0; from < total; from += PAGE_SIZE) {
    const url = new URL(`${REGISTRY_URL}/-/v1/search`);
    url.search = new URLSearchParams({
      text: `maintainer:${NPM_MAINTAINER}`,
      size: String(PAGE_SIZE),
      from: String(from),
    }).toString();

    const response = await fetchImpl(url);
    if (!response.ok) {
      throw new Error(`npm search failed: ${response.status} ${response.statusText}`);
    }

    const body = (await response.json()) as SearchResponse;
    total = body.total;
    for (const { package: pkg } of body.objects) names.add(pkg.name);
    if (body.objects.length === 0) break;
  }

  return [...names];
}

/**
 * Fetches every npm package maintained by {@link NPM_MAINTAINER}, with all-time download totals.
 * Throws on any HTTP failure so a broken build never deploys an incomplete catalogue; a package the
 * search still lists but the registry no longer has (404) is skipped.
 */
export async function fetchNpmPackages(fetchImpl: typeof fetch = fetch, now: Date = new Date()): Promise<Package[]> {
  const names = await searchNames(fetchImpl);

  const packages = await Promise.all(
    names.map(async (name) => {
      const response = await fetchImpl(`${REGISTRY_URL}/${name.replace('/', '%2F')}`);
      if (response.status === 404) return undefined;
      if (!response.ok) {
        throw new Error(`npm registry failed for ${name}: ${response.status} ${response.statusText}`);
      }
      const doc = (await response.json()) as Packument;
      return toNpmPackage(doc, await fetchTotalDownloads(name, doc.time?.created, fetchImpl, now));
    }),
  );

  return packages.filter((p): p is Package => p !== undefined);
}
