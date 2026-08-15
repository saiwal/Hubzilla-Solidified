// Single source of truth for this theme package's slug — same pattern as
// hubzilla-spa's own theme.config.mjs. Must be a valid PHP identifier
// fragment (lowercase letters/digits, no hyphens/underscores) since it's
// used verbatim in generated PHP function names (`{slug}_init()`, etc).
export const THEME_SLUG = "__THEME_SLUG__";

export const ASSET_WEB_PATH = `/view/theme/${THEME_SLUG}/assets`;

// Vite's build output (theme.php reads assets from here via manifest.php).
// This package lives at packages/theme-__THEME_SLUG__/, two levels deeper
// than hubzilla-spa's own root — hence three "../" instead of solidified's
// two. Adjust the DDEV-relative path below to match your own local setup.
export const BUILD_OUT_DIR_REL = `../../../hz-ddev/core/extend/theme/utsukta-themes/${THEME_SLUG}/assets`;

// Where build-sw.mjs writes sw.js.
export const SW_OUT_DIR_REL = `../../../hz-ddev/core/view/theme/${THEME_SLUG}/assets`;
