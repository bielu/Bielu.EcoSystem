import { FAMILIES, SECTIONS, type Family, type Section } from './families';
import type { FamilyIconName } from './family-icons';
import type { IllustrationName } from './illustrations';
import type { Package } from './nuget';

/** What a family tile shows: a hand-drawn icon, the curated illustration, or a package's own NuGet icon. */
export type FamilyArt =
  | { kind: 'icon'; name: FamilyIconName }
  | { kind: 'illustration'; name: IllustrationName }
  | { kind: 'image'; src: string };

export interface FamilyGroup {
  family: Family;
  /** Curated summary, or the top package's description for auto-detected families. */
  summary: string;
  /** Most downloaded first. */
  packages: Package[];
  totalDownloads: number;
  /** How many of {@link packages} are deprecated on NuGet. */
  deprecatedCount: number;
  art: FamilyArt;
  hue: number;
  /** Bento grid column span (out of {@link BENTO_COLUMNS}). */
  span: number;
}

export interface SectionGroup {
  section: Section;
  title: string;
  sub: string;
  families: FamilyGroup[];
}

export interface Catalog {
  sections: SectionGroup[];
  packageCount: number;
  totalDownloads: number;
}

/** Returns the curated family with the longest prefix matching `id` (case-insensitive). */
export function curatedFamilyFor(id: string, families: Family[] = FAMILIES): Family | undefined {
  const lower = id.toLowerCase();
  let best: Family | undefined;
  let bestLength = 0;
  for (const family of families) {
    for (const prefix of family.prefixes) {
      if (prefix.length > bestLength && lower.startsWith(prefix.toLowerCase())) {
        best = family;
        bestLength = prefix.length;
      }
    }
  }
  return best;
}

const GITHUB_REPO = /^https?:\/\/github\.com\/([^/]+)\/([^/#?]+)/i;

export const slugify = (value: string): string =>
  value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

/**
 * Derives a family for a package no curated family claims: packages sharing a GitHub repository
 * (their `projectUrl`) group together; otherwise packages group by the first two segments of their id.
 */
export function autoFamilyFor(pkg: Package): Family {
  const repo = pkg.projectUrl?.match(GITHUB_REPO);
  if (repo) {
    const name = repo[2]!.replace(/\.git$/i, '');
    return {
      slug: slugify(`${repo[1]}-${name}`),
      name,
      section: 'libraries',
      prefixes: [],
      repo: `https://github.com/${repo[1]}/${name}`,
    };
  }

  const stem = pkg.id.split('.').slice(0, 2).join('.');
  return { slug: slugify(stem), name: stem, section: 'libraries', prefixes: [stem] };
}

/** Curated family when one matches, otherwise an automatically derived one. */
export const familyFor = (pkg: Package, families: Family[] = FAMILIES): Family =>
  curatedFamilyFor(pkg.id, families) ?? autoFamilyFor(pkg);

const byDownloads = (a: { totalDownloads: number }, b: { totalDownloads: number }) =>
  b.totalDownloads - a.totalDownloads;

/** First sentence of a description, for families with no curated summary. */
export function firstSentence(text: string): string {
  const match = text.match(/^.*?[.!?](?=\s|$)/s);
  return (match ? match[0] : text).trim();
}

/** Stable hue for families without a curated one, so auto families don't all look alike. */
export function hueFor(slug: string): number {
  let hash = 0;
  for (const char of slug) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  return hash % 360;
}

/** Hand-drawn icon first, then the curated illustration, then the top package's NuGet icon, then generic art. */
export function artFor(family: Family, packages: Package[]): FamilyArt {
  if (family.icon) return { kind: 'icon', name: family.icon };
  if (family.illustration) return { kind: 'illustration', name: family.illustration };
  const icon = packages.find((p) => p.iconUrl)?.iconUrl;
  return icon ? { kind: 'image', src: icon } : { kind: 'illustration', name: 'package' };
}

/**
 * Compact labels for a family's packages: the dot-segments every id shares are dropped, as is a
 * leading `AspNetCore` segment. An id equal to the shared part keeps its last segment.
 * `[Bielu.AspNetCore.AsyncApi, Bielu.AspNetCore.AsyncApi.Scalar.SignalR]` → `[AsyncApi, Scalar.SignalR]`.
 */
export function shortNames(ids: string[]): string[] {
  const split = ids.map((id) => id.split('.'));
  if (split.length === 0) return [];
  let common = 0;
  while (split.every((parts) => parts.length > common && parts[common]!.toLowerCase() === split[0]![common]!.toLowerCase())) {
    common++;
  }
  return split.map((parts) => {
    const rest = parts.slice(common);
    if (rest[0]?.toLowerCase() === 'aspnetcore' && rest.length > 1) rest.shift();
    return rest.length > 0 ? rest.join('.') : parts.at(-1)!;
  });
}

export const BENTO_COLUMNS = 6;

/**
 * Column spans that fill every bento row exactly. Rows alternate between a pair (4 + 2) and a
 * trio (2 + 2 + 2); successive pairs swap which side is wide, giving a zig-zag rhythm. A row never
 * takes more tiles than remain, and a single leftover tile becomes a full-width banner.
 */
export function bentoSpans(count: number): number[] {
  const spans: number[] = [];
  let pairs = 0;
  for (let i = 0, row = 0; i < count; row++) {
    const size = Math.min(row % 2 === 0 ? 2 : 3, count - i);

    if (size === 1) spans.push(BENTO_COLUMNS);
    else if (size === 3) spans.push(2, 2, 2);
    else spans.push(...(pairs++ % 2 === 0 ? [4, 2] : [2, 4]));
    i += size;
  }
  return spans;
}

/**
 * Groups packages into families and families into sections. Sections keep the order of
 * {@link SECTIONS}; curated families keep their declaration order, followed by auto-detected
 * families by download count. Auto-detected families whose packages are all deprecated move to legacy.
 */
export function buildCatalog(packages: Package[], families: Family[] = FAMILIES): Catalog {
  const groups = new Map<string, { family: Family; packages: Package[] }>();
  for (const pkg of packages) {
    const family = familyFor(pkg, families);
    const group = groups.get(family.slug) ?? { family, packages: [] };
    group.packages.push(pkg);
    groups.set(family.slug, group);
  }

  const curatedOrder = new Map(families.map((f, i) => [f.slug, i]));
  const ordered = [...groups.values()]
    .map(({ family, packages: members }) => {
      const sorted = [...members].sort(byDownloads);
      const curated = curatedOrder.has(family.slug);
      const section = !curated && sorted.every((p) => p.deprecation) ? 'legacy' : family.section;
      return {
        family: { ...family, section },
        summary: family.summary ?? firstSentence(sorted[0]!.description),
        packages: sorted,
        totalDownloads: sum(sorted),
        deprecatedCount: sorted.filter((p) => p.deprecation).length,
        art: artFor(family, sorted),
        hue: family.hue ?? hueFor(family.slug),
      };
    })
    .sort(
      (a, b) =>
        (curatedOrder.get(a.family.slug) ?? Infinity) - (curatedOrder.get(b.family.slug) ?? Infinity) ||
        byDownloads(a, b),
    );

  const sections = (Object.keys(SECTIONS) as Section[])
    .map((section): SectionGroup => {
      const members = ordered.filter((g) => g.family.section === section);
      const spans = bentoSpans(members.length);
      return { section, ...SECTIONS[section], families: members.map((g, i) => ({ ...g, span: spans[i]! })) };
    })
    .filter((s) => s.families.length > 0);

  return { sections, packageCount: packages.length, totalDownloads: sum(packages) };
}

function sum(packages: Package[]): number {
  return packages.reduce((total, p) => total + p.totalDownloads, 0);
}

/** `1234` → `1.2k`, `190000` → `190k`, `1500000` → `1.5M`. */
export function formatCount(value: number): string {
  if (value < 1000) return String(value);
  const [divisor, suffix] = value < 1_000_000 ? [1000, 'k'] : [1_000_000, 'M'];
  const scaled = value / divisor;
  return `${scaled < 10 ? Math.floor(scaled * 10) / 10 : Math.floor(scaled)}${suffix}`;
}

/** Rounds down to a headline figure, e.g. `95` → `90+`, `191234` → `190k+`. */
export function formatHeadline(value: number): string {
  if (value < 10) return String(value);
  if (value < 1000) return `${Math.floor(value / 10) * 10}+`;
  return `${formatCount(Math.floor(value / 10_000) * 10_000 || value)}+`;
}

/** The version a reader should install: latest stable if one exists, otherwise latest prerelease. */
export const recommendedVersion = (pkg: Package): string => pkg.stableVersion ?? pkg.version;

export interface InstallSnippet {
  label: string;
  code: string;
}

/** Install instructions appropriate for the package type (library, dotnet tool or template pack). */
export function installSnippets(pkg: Package): InstallSnippet[] {
  const version = recommendedVersion(pkg);
  const prerelease = version.includes('-');

  switch (pkg.type) {
    case 'DotnetTool':
      return [
        { label: '.NET CLI (global)', code: `dotnet tool install --global ${pkg.id} --version ${version}` },
        { label: '.NET CLI (local)', code: `dotnet tool install ${pkg.id} --version ${version}` },
      ];
    case 'Template':
      return [{ label: '.NET CLI', code: `dotnet new install ${pkg.id}::${version}` }];
    default:
      return [
        {
          label: '.NET CLI',
          code: `dotnet add package ${pkg.id}${prerelease ? ` --version ${version}` : ''}`,
        },
        { label: 'PackageReference', code: `<PackageReference Include="${pkg.id}" Version="${version}" />` },
        {
          label: 'Central Package Management',
          code: `<!-- Directory.Packages.props -->\n<PackageVersion Include="${pkg.id}" Version="${version}" />\n\n<!-- .csproj -->\n<PackageReference Include="${pkg.id}" />`,
        },
      ];
  }
}

/** One-line deprecation explanation, e.g. `Deprecated (Legacy). Use Foo.Bar instead.` Empty when not deprecated. */
export function deprecationNote(pkg: Package): string {
  const d = pkg.deprecation;
  if (!d) return '';
  const reasons = d.reasons.length > 0 ? ` (${d.reasons.join(', ')})` : '';
  const message = d.message ? ` ${d.message.trim().replace(/\.?$/, '.')}` : '';
  const alternative = d.alternatePackage ? ` Use ${d.alternatePackage.id} instead.` : '';
  return `Deprecated${reasons}.${message}${alternative}`;
}

/** NuGet gallery URL for a package, optionally pinned to a version. */
export const nugetUrl = (id: string, version?: string): string =>
  `https://www.nuget.org/packages/${id}${version ? `/${version}` : ''}`;

/** Site-relative URL of a package's detail page. NuGet ids are case-insensitive, so slugs are lowercase. */
export const packagePath = (id: string): string => `/packages/${id.toLowerCase()}/`;
