// Pure palette logic for the "custom" theme. No DOM, no network — see
// useTheme.ts for the applying/persisting side, useTheme.test.ts for the check.
import type { CustomThemeColors } from "../types/theme.types";

const mix = (a: string, b: string, pct: string) => `color-mix(in srgb, ${a}, ${b} ${pct})`;
const tint = (c: CustomThemeColors) => (c.isDark ? "white" : "black");
const shade = (c: CustomThemeColors) => (c.isDark ? "black" : "white");

/** Every `--color-*` var a theme defines, with the formula used when it isn't overridden. */
export const THEME_VARS = [
  { key: "base", css: "--color-base", derive: (c: CustomThemeColors) => c.base },
  { key: "surface", css: "--color-surface", derive: (c) => mix(c.base, tint(c), "8%") },
  { key: "elevated", css: "--color-elevated", derive: (c) => mix(c.base, tint(c), "18%") },
  { key: "overlay", css: "--color-overlay", derive: (c) => mix(c.base, shade(c), "8%") },
  { key: "txt", css: "--color-txt", derive: (c) => c.txt },
  { key: "muted", css: "--color-muted", derive: (c) => mix(c.txt, c.base, "50%") },
  { key: "subtle", css: "--color-subtle", derive: (c) => mix(c.txt, c.base, "70%") },
  { key: "rim", css: "--color-rim", derive: (c) => mix(c.txt, c.base, "78%") },
  { key: "rimStrong", css: "--color-rim-strong", derive: (c) => mix(c.txt, c.base, "68%") },
  { key: "accent", css: "--color-accent", derive: (c) => c.accent },
  { key: "accentMuted", css: "--color-accent-muted", derive: (c) => mix(c.accent, c.base, "82%") },
  { key: "accentTxt", css: "--color-accent-txt", derive: (c) => mix(c.accent, tint(c), "15%") },
  { key: "accentFg", css: "--color-accent-fg", derive: () => "#ffffff" },
] as const satisfies readonly {
  key: keyof CustomThemeColors;
  css: string;
  derive: (c: CustomThemeColors) => string;
}[];

/** The vars beyond base/txt/accent — editable individually, derived when unset. */
export type DerivedColorKey = Exclude<
  (typeof THEME_VARS)[number]["key"],
  "base" | "txt" | "accent"
>;

/** Which overrides stop being valid when one of the base knobs changes. */
const DEPENDENTS: Partial<Record<keyof CustomThemeColors, DerivedColorKey[]>> = {
  base: ["surface", "elevated", "overlay", "muted", "subtle", "rim", "rimStrong", "accentMuted"],
  txt: ["muted", "subtle", "rim", "rimStrong"],
  accent: ["accentMuted", "accentTxt"],
  isDark: ["surface", "elevated", "overlay", "accentTxt"],
};

/**
 * Set one color, dropping the overrides that were derived from it so they
 * re-derive. Passing `undefined` clears the key (reset to derived).
 */
export function withColorChange(
  colors: CustomThemeColors,
  key: keyof CustomThemeColors,
  value: string | boolean | undefined
): CustomThemeColors {
  const next = { ...colors } as Record<string, unknown>;
  if (value === undefined) delete next[key];
  else next[key] = value;
  for (const dep of DEPENDENTS[key] ?? []) delete next[dep];
  return next as unknown as CustomThemeColors;
}

/** Overrides win; anything unset falls back to its formula. */
export function buildCustomThemeCSS(colors: CustomThemeColors): string {
  const rows = THEME_VARS.map(
    ({ key, css, derive }) => `  ${css}: ${colors[key] ?? derive(colors)};`
  );
  return `[data-theme="custom"] {\n${rows.join("\n")}\n}`;
}
