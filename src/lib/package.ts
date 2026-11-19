/** Where a package is published. */
export type Registry = 'nuget' | 'npm';

export const REGISTRY_LABELS: Record<Registry, string> = { nuget: 'NuGet', npm: 'npm' };

export type PackageType = 'Dependency' | 'DotnetTool' | 'Template' | (string & {});

export interface PackageVersion {
  version: string;
  /** All-time downloads of this version, when the registry reports them (NuGet does, npm does not). */
  downloads?: number;
}

export interface PackageDeprecation {
  reasons: string[];
  message?: string;
  alternatePackage?: { id: string; range?: string };
}

/** A package as the catalogue uses it, normalised from whichever registry published it. */
export interface Package {
  registry: Registry;
  /** NuGet id or npm name, e.g. `Bielu.AspNetCore.AsyncApi` or `@bielu/scalar-signalr`. */
  id: string;
  /** Latest version, prerelease included. */
  version: string;
  /** Latest stable version, or `undefined` when only prereleases have shipped. */
  stableVersion?: string;
  description: string;
  projectUrl?: string;
  iconUrl?: string;
  tags: string[];
  totalDownloads: number;
  /** NuGet verified-owner prefix reservation; always `false` for npm. */
  verified: boolean;
  type: PackageType;
  /** Newest first. */
  versions: PackageVersion[];
  deprecation?: PackageDeprecation;
}

export const isPrerelease = (version: string): boolean => version.includes('-');
