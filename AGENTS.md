# AGENTS.md

Guidance for AI coding agents working in this repository. See [README.md](./README.md) for what the site does.

## What this project is

The Astro static site behind [packages.bielu.pl](https://packages.bielu.pl). It lists every NuGet package owned
by `bielu`, collected at build time and grouped into families. [bielu.pl](https://bielu.pl) (repo
`bielu/bielu.github.io`) links here and owns the design tokens this site reuses.

## Layout

| Path | Purpose |
|------|---------|
| `src/lib/nuget.ts` | NuGet search API client: fetch + normalise into `Package` |
| `src/lib/families.ts` | Curated families and section copy, the only hand-maintained data |
| `src/lib/family-icons.ts` | Names of the hand-drawn family icons in `src/assets/family-icons/` (SVG, frame included) |
| `src/lib/illustrations.ts` | Flat fallback illustrations for families without an icon |
| `src/lib/catalog.ts` | Pure logic: curated/automatic grouping, formatting, install snippets, URLs |
| `src/lib/data.ts` | Memoised build-time catalogue shared by all pages |
| `src/components/` | `FamilyTile` (one bento tile) and `FamilyArt` (icon / illustration / NuGet image) |
| `src/pages/index.astro` | Catalogue with client-side filter |
| `src/pages/packages/[id].astro` | One static page per package |
| `src/styles/global.css` | Tokens and base styles mirrored from bielu.pl |
| `test/` | Vitest unit tests for `src/lib` |

## Conventions

- **Keep logic in `src/lib`, keep pages thin.** Anything testable (grouping, formatting, URLs) is a pure
  function in `src/lib` with tests. `.astro` files only render.
- **Adding a package needs no code.** Publish it to NuGet and it appears after the next build, grouped
  automatically. Add or extend a curated family in `families.ts` only to give it a better name, section,
  summary or links. The longest matching prefix wins, so declaration order is only display order. Keep slugs unique,
  which a test enforces.
- **Design:** reuse the tokens in `global.css` and support light and dark themes. Layouts must work at
  phone width with no horizontal scroll.
- **Formatting:** follow [`.editorconfig`](./.editorconfig) (2 spaces, LF, final newline).
- **Tests:** Vitest, using `Method_Scenario_ExpectedResult` names and Arrange / Act / Assert comments.
  No network calls in tests; pass a fake `fetch` to `fetchPackages`.

## Engineering principles

- **SOLID:** single-purpose modules (fetching, curation and grouping stay separate), and dependencies are
  injected where it matters (`fetchPackages(fetchImpl)`, `buildCatalog(packages, families)`).
- **DRY:** shared styling lives in `global.css` and shared logic in `catalog.ts`. Don't duplicate either
  in pages.
- **KISS:** use static output and a few lines of vanilla JS for interactivity. No UI framework or extra
  dependencies without a real need.

## Code coverage

Target **70%+ line coverage** for `src/lib`. `npm run test:coverage` enforces it.

## Before opening a PR

1. `npm test` passes, and `npm run test:coverage` meets the threshold.
2. `npm run build` succeeds (it runs `astro check` first).
3. Preview the built site locally (`npm run preview`) and check the change visually, in light and dark.
4. Update `README.md` / `AGENTS.md` when behaviour or structure changes.
5. Work on a branch and target `main`. CI tests and builds every PR; merging to `main` deploys.
