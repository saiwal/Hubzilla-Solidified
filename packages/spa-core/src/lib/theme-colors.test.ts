// node --experimental-strip-types packages/spa-core/src/lib/theme-colors.test.ts
import assert from "node:assert";

const { buildCustomThemeCSS, withColorChange } = await import("./theme-colors.ts");

const legacy = { base: "#1e1e2e", txt: "#cdd6f4", accent: "#cba6f7", isDark: true };

// A 3-key object (what older accounts have stored) still derives everything.
const legacyCss = buildCustomThemeCSS(legacy);
assert(legacyCss.includes("--color-base: #1e1e2e;"));
assert(legacyCss.includes("--color-surface: color-mix(in srgb, #1e1e2e, white 8%);"));

// A palette captured from a preset is emitted verbatim, not re-mixed.
const nord = {
  base: "#2e3440", txt: "#eceff4", accent: "#88c0d0", isDark: true,
  surface: "#3b4252", rim: "#4c566a", accentMuted: "#2d3f4f",
};
const nordCss = buildCustomThemeCSS(nord);
assert(nordCss.includes("--color-surface: #3b4252;"));
assert(nordCss.includes("--color-rim: #4c566a;"));

// Changing the accent re-derives only the accent-dependent vars.
const reaccented = withColorChange(nord, "accent", "#ff0000");
const reaccentedCss = buildCustomThemeCSS(reaccented);
assert(reaccentedCss.includes("--color-accent: #ff0000;"));
assert(reaccentedCss.includes("--color-accent-muted: color-mix(in srgb, #ff0000, #2e3440 82%);"));
assert(reaccentedCss.includes("--color-surface: #3b4252;"), "surface must survive an accent edit");
assert(reaccentedCss.includes("--color-rim: #4c566a;"), "rim must survive an accent edit");

// Changing the background drops the overrides mixed from the old background.
const rebased = withColorChange(nord, "base", "#000000");
assert(!("surface" in rebased));
assert(!("rim" in rebased));
assert(buildCustomThemeCSS(rebased).includes("--color-surface: color-mix(in srgb, #000000, white 8%);"));

// undefined = reset one advanced row back to derived.
assert(!("surface" in withColorChange(nord, "surface", undefined)));
assert("rim" in withColorChange(nord, "surface", undefined));

console.log("theme-colors: ok");
