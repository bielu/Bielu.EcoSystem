/**
 * Flat tile illustrations, styled after the existing NuGet package logos: white shapes on a coloured
 * gradient with a single warm accent. Each entry is inner SVG markup for a `0 0 64 64` viewBox;
 * `FamilyArt.astro` supplies the gradient tile behind it.
 */

const W = 'fill="#fff"';
const SOFT = 'fill="#fff" fill-opacity=".35"';
const LINE = 'fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"';
const ACCENT = 'fill="#ffd166"';

export const ILLUSTRATIONS = {
  bindings: `
    <rect x="6" y="14" width="18" height="36" rx="5" ${SOFT}/>
    <rect x="40" y="14" width="18" height="36" rx="5" ${SOFT}/>
    <path d="M24 22h16M24 32h16M24 42h16" ${LINE}/>
    <circle cx="32" cy="22" r="3.5" ${W}/><circle cx="32" cy="32" r="3.5" ${ACCENT}/><circle cx="32" cy="42" r="3.5" ${W}/>`,
  console: `
    <rect x="8" y="12" width="48" height="40" rx="6" ${SOFT}/>
    <rect x="8" y="12" width="48" height="9" rx="4" ${W} fill-opacity=".7"/>
    <circle cx="14" cy="16.5" r="1.6" ${ACCENT}/>
    <path d="M16 31l6 5-6 5" ${LINE}/>
    <path d="M27 41h10" ${LINE}/>
    <path d="M42 28h8M42 34h5" ${LINE} stroke-opacity=".6"/>`,
  workflow: `
    <circle cx="14" cy="18" r="7" ${W}/>
    <rect x="25" y="26" width="14" height="14" rx="3" ${SOFT}/>
    <circle cx="50" cy="46" r="7" ${ACCENT}/>
    <path d="M19 23l6 6M39 37l6 5" ${LINE}/>
    <path d="M14 25v19h24" ${LINE} stroke-opacity=".5" stroke-dasharray="1 5"/>`,
  layers: `
    <path d="M32 40L8 30l24-10 24 10z" ${SOFT}/>
    <path d="M32 34L8 24l24-10 24 10z" ${W} fill-opacity=".6"/>
    <path d="M32 28L8 18 32 8l24 10z" ${W}/>
    <path d="M8 38l24 10 24-10M8 46l24 10 24-10" ${LINE}/>
    <circle cx="32" cy="18" r="3.5" ${ACCENT}/>`,
  terminal: `
    <rect x="6" y="12" width="40" height="34" rx="5" ${SOFT}/>
    <path d="M14 24l6 5-6 5M24 35h10" ${LINE}/>
    <circle cx="46" cy="44" r="12" ${ACCENT}/>
    <path d="M46 37v14M39 44h14" fill="none" stroke="#fff" stroke-width="3.5" stroke-linecap="round"/>`,
  containers: `
    <rect x="8" y="34" width="14" height="12" rx="2" ${W}/>
    <rect x="25" y="34" width="14" height="12" rx="2" ${SOFT}/>
    <rect x="42" y="34" width="14" height="12" rx="2" ${W}/>
    <rect x="16" y="20" width="14" height="12" rx="2" ${SOFT}/>
    <rect x="33" y="20" width="14" height="12" rx="2" ${ACCENT}/>
    <path d="M4 50h56" ${LINE}/>
    <path d="M10 54c4 3 8 3 12 0s8-3 12 0 8 3 12 0 8-3 12 0" ${LINE} stroke-opacity=".5"/>`,
  spark: `
    <path d="M32 6l5 16 16 5-16 5-5 16-5-16-16-5 16-5z" ${W}/>
    <path d="M50 38l2.5 7 7 2.5-7 2.5-2.5 7-2.5-7-7-2.5 7-2.5z" ${ACCENT}/>
    <circle cx="14" cy="46" r="4" ${SOFT}/><circle cx="50" cy="14" r="3" ${SOFT}/>`,
  key: `
    <circle cx="22" cy="32" r="13" ${W}/>
    <circle cx="22" cy="32" r="5" ${ACCENT}/>
    <path d="M35 32h21M48 32v8M54 32v6" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round"/>`,
  database: `
    <ellipse cx="26" cy="16" rx="16" ry="6" ${W}/>
    <path d="M10 16v28c0 3.3 7.2 6 16 6s16-2.7 16-6V16" ${SOFT}/>
    <path d="M10 26c0 3.3 7.2 6 16 6s16-2.7 16-6M10 36c0 3.3 7.2 6 16 6s16-2.7 16-6" ${LINE} stroke-opacity=".7"/>
    <circle cx="46" cy="44" r="12" ${ACCENT}/>
    <path d="M46 37v7l5 3" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round"/>`,
  badge: `
    <rect x="12" y="8" width="40" height="48" rx="6" ${SOFT}/>
    <circle cx="32" cy="26" r="8" ${W}/>
    <path d="M20 46c2-7 7-10 12-10s10 3 12 10" ${W}/>
    <rect x="26" y="4" width="12" height="8" rx="2" ${ACCENT}/>`,
  inspect: `
    <path d="M14 18l-8 10 8 10M38 18l8 10-8 10" ${LINE} stroke-opacity=".6"/>
    <path d="M30 14l-8 28" ${LINE} stroke-opacity=".6"/>
    <circle cx="38" cy="36" r="11" fill="#fff" fill-opacity=".2" stroke="#fff" stroke-width="4"/>
    <path d="M46 44l10 10" fill="none" stroke="#ffd166" stroke-width="6" stroke-linecap="round"/>`,
  blocks: `
    <rect x="8" y="30" width="22" height="22" rx="4" ${W}/>
    <rect x="34" y="30" width="22" height="22" rx="4" ${SOFT}/>
    <rect x="21" y="8" width="22" height="20" rx="4" ${ACCENT}/>`,
  plane: `
    <path d="M6 30L58 8 46 54 32 40z" ${W}/>
    <path d="M32 40l-4 14 8-10" ${SOFT}/>
    <path d="M32 40L58 8" ${LINE} stroke="#ffd166"/>`,
  braces: `
    <path d="M22 10c-6 0-8 3-8 8v6c0 4-2 6-6 8 4 2 6 4 6 8v6c0 5 2 8 8 8M42 10c6 0 8 3 8 8v6c0 4 2 6 6 8-4 2-6 4-6 8v6c0 5-2 8-8 8" ${LINE}/>
    <circle cx="25" cy="32" r="3.5" ${W}/><circle cx="32" cy="32" r="3.5" ${ACCENT}/><circle cx="39" cy="32" r="3.5" ${W}/>`,
  logs: `
    <rect x="8" y="10" width="48" height="44" rx="6" ${SOFT}/>
    <path d="M17 22h4M27 22h20M17 32h4M27 32h14M17 42h4M27 42h18" ${LINE}/>
    <circle cx="19" cy="32" r="3" ${ACCENT}/>`,
  search: `
    <rect x="6" y="10" width="32" height="6" rx="3" ${SOFT}/>
    <rect x="6" y="22" width="22" height="6" rx="3" ${SOFT}/>
    <circle cx="36" cy="36" r="13" fill="#fff" fill-opacity=".2" stroke="#fff" stroke-width="4"/>
    <path d="M45 45l11 11" fill="none" stroke="#ffd166" stroke-width="6" stroke-linecap="round"/>`,
  globe: `
    <circle cx="32" cy="32" r="22" ${SOFT}/>
    <ellipse cx="32" cy="32" rx="9" ry="22" fill="none" stroke="#fff" stroke-width="3"/>
    <path d="M10 32h44M14 21h36M14 43h36" ${LINE}/>
    <circle cx="50" cy="14" r="6" ${ACCENT}/>`,
  book: `
    <path d="M32 14c-6-4-14-5-22-4v38c8-1 16 0 22 4z" ${W}/>
    <path d="M32 14c6-4 14-5 22-4v38c-8-1-16 0-22 4z" ${SOFT}/>
    <path d="M38 22h10M38 30h10M38 38h7" ${LINE} stroke-opacity=".8"/>
    <rect x="16" y="6" width="6" height="14" rx="1" ${ACCENT}/>`,
  package: `
    <path d="M32 6l22 11v26L32 54 10 43V17z" ${SOFT}/>
    <path d="M10 17l22 11 22-11M32 28v26" ${LINE}/>
    <path d="M21 11.5l22 11" fill="none" stroke="#ffd166" stroke-width="4"/>`,
} satisfies Record<string, string>;

export type IllustrationName = keyof typeof ILLUSTRATIONS;
