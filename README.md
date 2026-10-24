# Bielu.EcoSystem

Source for [packages.bielu.pl](https://packages.bielu.pl): a catalogue of every NuGet package in the bielu
.NET ecosystem, grouped into families by category. Built with [Astro](https://astro.build) and served by GitHub Pages.
Linked from [bielu.pl](https://bielu.pl) ([bielu/bielu.github.io](https://github.com/bielu/bielu.github.io)).

## How it works

- **Collection.** At build time the site queries the NuGet search API for every package owned by `bielu`,
  prereleases included (`src/lib/nuget.ts`). Nothing is committed: a nightly scheduled build picks up new
  packages and versions.
- **Grouping.** Packages are grouped into families (`src/lib/catalog.ts`):
  1. A curated family in `src/lib/families.ts` claims a package by id prefix; the **longest** matching
     prefix wins, so `Bielu.AspNetCore.AsyncApi.Scalar` beats `Bielu.AspNetCore.AsyncApi`. Curated
     families are categories (AsyncAPI, Arazzo, Overlay, consoles…) and set the name, section
     (flagship / infrastructure / libraries / legacy), summary, art and repo/docs links.
  2. Otherwise packages are grouped **automatically**: by GitHub repository (`projectUrl`), or failing that
     by the first two segments of the id. Auto families land in *Libraries*, or in *Legacy* when every
     package in them is deprecated.
- **Art.** A family shows its hand-drawn icon (`src/assets/family-icons/<name>.svg`, listed in
  `src/lib/family-icons.ts`), else a flat illustration (`src/lib/illustrations.ts`), else its top
  package's NuGet icon. The same SVGs are rendered to PNG as the packages' NuGet icons.
- **Deprecation.** Deprecated packages are badged and struck through on the index, and their pages
  explain why and link to the replacement.
- **Pages.** `/` lists every family as a bento grid (wide and narrow tiles alternating) with a
  client-side filter; `/packages/<id>/` shows install commands
  (CLI, `PackageReference`, Central Package Management, `dotnet tool` / `dotnet new` as appropriate),
  tags, versions and sibling packages.

## Development

Requires Node.js 22+.

```bash
npm ci
npm run dev            # http://localhost:4321
npm test               # unit tests
npm run test:coverage  # with coverage (70% line threshold)
npm run build          # astro check + static build into dist/
npm run preview        # serve dist/
```

## Deploying

`.github/workflows/deploy.yml` tests and builds on every PR, and deploys to GitHub Pages on pushes to
`main`, nightly, and on manual dispatch. One-time setup:

1. Repo **Settings → Pages → Source**: *GitHub Actions*.
2. DNS: `CNAME` record `packages` → `bielu.github.io.`
3. Pages custom domain `packages.bielu.pl` (bound by `public/CNAME`), then **Enforce HTTPS**.
