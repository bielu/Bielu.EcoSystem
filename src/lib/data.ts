import { buildCatalog, type Catalog } from './catalog';
import { fetchPackages } from './nuget';

let catalog: Promise<Catalog> | undefined;

/** Build-time catalogue, fetched from NuGet once per build and shared by every page. */
export function getCatalog(): Promise<Catalog> {
  catalog ??= fetchPackages().then((packages) => buildCatalog(packages));
  return catalog;
}
