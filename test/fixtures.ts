import type { Family } from '../src/lib/families';
import type { Package } from '../src/lib/nuget';

export function makePackage(overrides: Partial<Package> & { id: string }): Package {
  return {
    version: '1.0.0',
    stableVersion: '1.0.0',
    description: `${overrides.id} description. More text.`,
    tags: [],
    totalDownloads: 0,
    verified: true,
    type: 'Dependency',
    versions: [{ version: '1.0.0', downloads: 0 }],
    ...overrides,
  };
}

export const families: Family[] = [
  { slug: 'flag', name: 'Flagship', section: 'flagship', summary: 'Flag.', prefixes: ['Acme.Core'], hue: 10 },
  {
    slug: 'flag-ui',
    name: 'Flagship UI',
    section: 'flagship',
    summary: 'UI.',
    prefixes: ['Acme.Core.Ui'],
    illustration: 'console',
  },
  { slug: 'old', name: 'Old', section: 'legacy', summary: 'Old.', prefixes: ['Acme.Legacy.', 'Other.Legacy'] },
];
