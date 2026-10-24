import { describe, expect, it } from 'vitest';
import {
  artFor,
  autoFamilyFor,
  bentoSpans,
  buildCatalog,
  curatedFamilyFor,
  deprecationNote,
  firstSentence,
  formatCount,
  formatHeadline,
  hueFor,
  installSnippets,
  nugetUrl,
  packagePath,
  recommendedVersion,
  shortNames,
  slugify,
} from '../src/lib/catalog';
import { FAMILIES } from '../src/lib/families';
import { FAMILY_ICONS } from '../src/lib/family-icons';
import { ILLUSTRATIONS } from '../src/lib/illustrations';
import { families, makePackage } from './fixtures';

describe('curatedFamilyFor', () => {
  it('curatedFamilyFor_MatchesPrefixCaseInsensitively', () => {
    // Arrange / Act
    const family = curatedFamilyFor('acme.core.extras', families);

    // Assert
    expect(family?.slug).toBe('flag');
  });

  it('curatedFamilyFor_PrefersLongestPrefixRegardlessOfOrder', () => {
    expect(curatedFamilyFor('Acme.Core.Ui.Grid', families)?.slug).toBe('flag-ui');
    expect(curatedFamilyFor('Acme.Core.Data', families)?.slug).toBe('flag');
  });

  it('curatedFamilyFor_ReturnsUndefinedWhenNothingMatches', () => {
    expect(curatedFamilyFor('Unknown.Pkg', families)).toBeUndefined();
  });

  it('curatedFamilyFor_DefaultFamiliesClaimFlagshipPackages', () => {
    expect(curatedFamilyFor('Bielu.AspNetCore.AsyncApi')?.slug).toBe('asyncapi');
    expect(curatedFamilyFor('Bielu.AspNetCore.AsyncApi.Cli')?.slug).toBe('api-tooling');
    expect(curatedFamilyFor('Bielu.AspNetCore.AsyncApi.Scalar.SignalR.Aspire')?.slug).toBe('scalar-consoles');
    expect(curatedFamilyFor('Bielu.AspNetCore.Arazzo.Overlay')?.slug).toBe('overlay');
    expect(curatedFamilyFor('Bielu.Arazzo.NET.Readers')?.slug).toBe('arazzo');
    expect(curatedFamilyFor('Novicell.Examine.ElasticSearch')?.section).toBe('legacy');
  });

  it('FAMILIES_HaveUniqueSlugs', () => {
    const slugs = FAMILIES.map((f) => f.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });
});

describe('autoFamilyFor', () => {
  it('autoFamilyFor_GroupsByGitHubRepository', () => {
    // Arrange
    const pkg = makePackage({ id: 'Foo.Bar.Baz', projectUrl: 'https://github.com/bielu/Foo.Repo.git' });

    // Act
    const family = autoFamilyFor(pkg);

    // Assert
    expect(family).toMatchObject({
      slug: 'bielu-foo-repo',
      name: 'Foo.Repo',
      section: 'libraries',
      repo: 'https://github.com/bielu/Foo.Repo',
    });
  });

  it('autoFamilyFor_FallsBackToIdStemWithoutRepository', () => {
    // Arrange
    const pkg = makePackage({ id: 'Foo.Bar.Baz', projectUrl: 'https://example.com/' });

    // Act
    const family = autoFamilyFor(pkg);

    // Assert
    expect(family).toMatchObject({ slug: 'foo-bar', name: 'Foo.Bar', prefixes: ['Foo.Bar'] });
    expect(family.repo).toBeUndefined();
  });
});

describe('buildCatalog', () => {
  const packages = [
    makePackage({ id: 'Acme.Core', totalDownloads: 10 }),
    makePackage({ id: 'Acme.Core.Plus', totalDownloads: 50, iconUrl: 'https://x/icon.png' }),
    makePackage({ id: 'Acme.Core.Ui', totalDownloads: 0 }),
    makePackage({ id: 'Acme.Legacy.Thing', totalDownloads: 5 }),
    makePackage({ id: 'Zed.One', projectUrl: 'https://github.com/x/zed', totalDownloads: 1 }),
    makePackage({ id: 'Zed.Two', projectUrl: 'https://github.com/x/zed', totalDownloads: 2 }),
    makePackage({ id: 'Big.Lib', totalDownloads: 100, description: 'Does big things. Really.' }),
    makePackage({ id: 'Dead.Lib', deprecation: { reasons: ['Legacy'] } }),
  ];

  it('buildCatalog_GroupsIntoSectionsInDeclaredOrder', () => {
    // Act
    const catalog = buildCatalog(packages, families);

    // Assert
    expect(catalog.sections.map((s) => s.section)).toEqual(['flagship', 'libraries', 'legacy']);
    expect(catalog.packageCount).toBe(8);
    expect(catalog.totalDownloads).toBe(168);
  });

  it('buildCatalog_SortsPackagesByDownloadsAndSumsThem', () => {
    // Act
    const flagship = buildCatalog(packages, families).sections[0]!.families[0]!;

    // Assert
    expect(flagship.packages.map((p) => p.id)).toEqual(['Acme.Core.Plus', 'Acme.Core']);
    expect(flagship.totalDownloads).toBe(60);
    expect(flagship.summary).toBe('Flag.');
    expect(flagship.art).toEqual({ kind: 'image', src: 'https://x/icon.png' });
    expect(flagship.hue).toBe(10);
    expect(flagship.deprecatedCount).toBe(0);
  });

  it('buildCatalog_AssignsBentoSpansPerSection', () => {
    // Act
    const [flagship] = buildCatalog(packages, families).sections;

    // Assert
    expect(flagship!.families.map((f) => f.span)).toEqual([4, 2]);
    expect(flagship!.families[1]!.art).toEqual({ kind: 'illustration', name: 'console' });
  });

  it('buildCatalog_AutoGroupsUnclaimedPackagesByDownloads', () => {
    // Act
    const libraries = buildCatalog(packages, families).sections.find((s) => s.section === 'libraries')!;

    // Assert
    expect(libraries.families.map((f) => f.family.slug)).toEqual(['big-lib', 'x-zed']);
    expect(libraries.families[0]!.summary).toBe('Does big things.');
    expect(libraries.families[1]!.packages).toHaveLength(2);
  });

  it('buildCatalog_MovesFullyDeprecatedAutoFamiliesToLegacy', () => {
    // Act
    const legacy = buildCatalog(packages, families).sections.find((s) => s.section === 'legacy')!;

    // Assert
    expect(legacy.families.map((f) => f.family.slug)).toEqual(['old', 'dead-lib']);
    expect(legacy.families[1]!.deprecatedCount).toBe(1);
    expect(legacy.families[1]!.art).toEqual({ kind: 'illustration', name: 'package' });
    expect(legacy.families[1]!.hue).toBe(hueFor('dead-lib'));
  });

  it('buildCatalog_ReturnsNoSectionsForNoPackages', () => {
    expect(buildCatalog([], families)).toEqual({ sections: [], packageCount: 0, totalDownloads: 0 });
  });
});

describe('formatting', () => {
  it.each([
    [0, '0'],
    [999, '999'],
    [1234, '1.2k'],
    [18_385, '18k'],
    [190_500, '190k'],
    [1_550_000, '1.5M'],
    [25_000_000, '25M'],
  ])('formatCount_%i_Returns%s', (value, expected) => {
    expect(formatCount(value)).toBe(expected);
  });

  it.each([
    [7, '7'],
    [95, '90+'],
    [4321, '4.3k+'],
    [191_234, '190k+'],
  ])('formatHeadline_%i_Returns%s', (value, expected) => {
    expect(formatHeadline(value)).toBe(expected);
  });

  it('firstSentence_ReturnsWholeTextWithoutTerminator', () => {
    expect(firstSentence('No full stop here')).toBe('No full stop here');
    expect(firstSentence('Version 1.2 is out. Next.')).toBe('Version 1.2 is out.');
  });

  it('slugify_LowercasesAndCollapsesSeparators', () => {
    expect(slugify('--Foo.Bar  Baz--')).toBe('foo-bar-baz');
  });

  it('urls_AreBuiltFromIds', () => {
    expect(nugetUrl('Acme.Core')).toBe('https://www.nuget.org/packages/Acme.Core');
    expect(nugetUrl('Acme.Core', '1.0.0')).toBe('https://www.nuget.org/packages/Acme.Core/1.0.0');
    expect(packagePath('Acme.Core')).toBe('/packages/acme.core/');
  });
});

describe('installSnippets', () => {
  it('recommendedVersion_PrefersStable', () => {
    expect(recommendedVersion(makePackage({ id: 'A', version: '2.0.0-beta', stableVersion: '1.0.0' }))).toBe('1.0.0');
    expect(recommendedVersion(makePackage({ id: 'A', version: '2.0.0-beta', stableVersion: undefined }))).toBe(
      '2.0.0-beta',
    );
  });

  it('installSnippets_LibraryStableOmitsVersionFromCli', () => {
    // Act
    const snippets = installSnippets(makePackage({ id: 'Acme.Core' }));

    // Assert
    expect(snippets.map((s) => s.label)).toEqual(['.NET CLI', 'PackageReference', 'Central Package Management']);
    expect(snippets[0]!.code).toBe('dotnet add package Acme.Core');
    expect(snippets[2]!.code).toContain('<PackageVersion Include="Acme.Core" Version="1.0.0" />');
  });

  it('installSnippets_LibraryPrereleasePinsVersion', () => {
    const pkg = makePackage({ id: 'Acme.Core', version: '1.1.0-beta', stableVersion: undefined });
    expect(installSnippets(pkg)[0]!.code).toBe('dotnet add package Acme.Core --version 1.1.0-beta');
  });

  it('installSnippets_DotnetToolUsesToolInstall', () => {
    const snippets = installSnippets(makePackage({ id: 'Acme.Cli', type: 'DotnetTool' }));
    expect(snippets.map((s) => s.code)).toEqual([
      'dotnet tool install --global Acme.Cli --version 1.0.0',
      'dotnet tool install Acme.Cli --version 1.0.0',
    ]);
  });

  it('installSnippets_TemplateUsesDotnetNewInstall', () => {
    const snippets = installSnippets(makePackage({ id: 'Acme.Templates', type: 'Template' }));
    expect(snippets).toEqual([{ label: '.NET CLI', code: 'dotnet new install Acme.Templates::1.0.0' }]);
  });
});

describe('presentation helpers', () => {
  it.each([
    [0, []],
    [1, [6]],
    [2, [4, 2]],
    [3, [4, 2, 6]],
    [5, [4, 2, 2, 2, 2]],
    [6, [4, 2, 2, 2, 2, 6]],
    [7, [4, 2, 2, 2, 2, 2, 4]],
  ])('bentoSpans_%i_FillsRows', (count, expected) => {
    // Act
    const spans = bentoSpans(count);

    // Assert
    expect(spans).toEqual(expected);
  });

  it('bentoSpans_EveryRowSumsToSixColumns', () => {
    for (let count = 1; count <= 20; count++) {
      const total = bentoSpans(count).reduce((a, b) => a + b, 0);
      expect(total % 6).toBe(0);
    }
  });

  it('shortNames_DropSharedSegmentsAndAspNetCore', () => {
    expect(
      shortNames(['Bielu.AspNetCore.AsyncApi', 'Bielu.AspNetCore.AsyncApi.Scalar.SignalR', 'bielu.aspnetcore.asyncapi.Ui']),
    ).toEqual(['AsyncApi', 'Scalar.SignalR', 'Ui']);
    expect(shortNames(['Bielu.Arazzo.NET', 'Bielu.AspNetCore.Arazzo'])).toEqual(['Arazzo.NET', 'Arazzo']);
    expect(shortNames(['Solo.Package'])).toEqual(['Package']);
    expect(shortNames([])).toEqual([]);
  });

  it('artFor_PrefersDrawnIconThenIllustrationThenNuGetIconThenGeneric', () => {
    // Arrange
    const base = { slug: 'a', name: 'A', section: 'libraries' as const, prefixes: [] };
    const withIcon = [makePackage({ id: 'A' }), makePackage({ id: 'B', iconUrl: 'https://x/b.png' })];

    // Act / Assert
    expect(artFor({ ...base, icon: 'arazzo', illustration: 'key' }, withIcon)).toEqual({ kind: 'icon', name: 'arazzo' });
    expect(artFor({ ...base, illustration: 'key' }, withIcon)).toEqual({ kind: 'illustration', name: 'key' });
    expect(artFor(base, withIcon)).toEqual({ kind: 'image', src: 'https://x/b.png' });
    expect(artFor(base, [makePackage({ id: 'A' })])).toEqual({ kind: 'illustration', name: 'package' });
  });

  it('hueFor_IsStableAndInRange', () => {
    expect(hueFor('abc')).toBe(hueFor('abc'));
    expect(hueFor('some-long-family-slug')).toBeGreaterThanOrEqual(0);
    expect(hueFor('some-long-family-slug')).toBeLessThan(360);
  });

  it('deprecationNote_DescribesReasonMessageAndAlternative', () => {
    // Arrange
    const full = makePackage({
      id: 'Old',
      deprecation: { reasons: ['Legacy', 'Other'], message: 'Moved', alternatePackage: { id: 'New.Pkg' } },
    });
    const bare = makePackage({ id: 'Old', deprecation: { reasons: [] } });

    // Act / Assert
    expect(deprecationNote(full)).toBe('Deprecated (Legacy, Other). Moved. Use New.Pkg instead.');
    expect(deprecationNote(bare)).toBe('Deprecated.');
    expect(deprecationNote(makePackage({ id: 'Fine' }))).toBe('');
  });
});

describe('illustrations', () => {
  it('ILLUSTRATIONS_CoverEveryCuratedFamilyAndAreNonEmpty', () => {
    for (const family of FAMILIES) {
      if (family.illustration) expect(ILLUSTRATIONS[family.illustration]).toBeDefined();
    }
    for (const markup of Object.values(ILLUSTRATIONS)) expect(markup.trim()).toMatch(/^</);
  });
});

describe('family icons', () => {
  it('FAMILY_ICONS_EachHasSvgWithNamespacedIds', () => {
    // Arrange
    const files = import.meta.glob<string>('../src/assets/family-icons/*.svg', { query: '?raw', import: 'default', eager: true });

    for (const name of FAMILY_ICONS) {
      // Act
      const svg = files[`../src/assets/family-icons/${name}.svg`] ?? '';
      const ids = [...svg.matchAll(/id="([^"]+)"/g)].map((m) => m[1]!);

      // Assert
      expect(svg.trim()).toMatch(/^<svg[^>]*viewBox="0 0 128 128"/);
      for (const id of ids) expect(id.startsWith(`${name}-`)).toBe(true);
    }
  });

  it('FAMILIES_UseOnlyKnownIcons', () => {
    for (const family of FAMILIES) {
      if (family.icon) expect(FAMILY_ICONS).toContain(family.icon);
    }
  });
});
