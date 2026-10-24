/**
 * Hand-drawn family icons, styled after the AsyncAPI NuGet logo (navy outline, purple→blue gradient,
 * cyan, yellow accent, soft tile). Each name is a complete SVG in `src/assets/family-icons/<name>.svg`,
 * frame included, so the same file can later be published as the packages' NuGet icon.
 */
export const FAMILY_ICONS = ['protocol-bindings', 'scalar-consoles', 'arazzo', 'overlay', 'api-tooling', 'analyzers'] as const;

export type FamilyIconName = (typeof FAMILY_ICONS)[number];
