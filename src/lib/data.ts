import { buildCatalog, type Catalog } from './catalog';
import { fetchNpmPackages } from './npm';
import { fetchNugetPackages } from './nuget';

let catalog: Promise<Catalog> | undefined;

/** Build-time catalogue, fetched from NuGet and npm once per build and shared by every page. */
export function getCatalog(): Promise<Catalog> {
  catalog ??= Promise.all([fetchNugetPackages(), fetchNpmPackages()]).then(([nuget, npm]) =>
    buildCatalog([...nuget, ...npm]),
  );
  return catalog;
}
