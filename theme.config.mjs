// Single source of truth for this theme package's slug. Every place that
// currently hardcodes "solidified" (asset paths, PHP namespace/function
// names copied into the deployed theme) derives from this constant instead.
export const THEME_SLUG = "solidified";

export const ASSET_WEB_PATH = `/view/theme/${THEME_SLUG}/assets`;

// Vite's build output (theme.php reads assets from here via manifest.php).
export const BUILD_OUT_DIR_REL = `../hz-ddev/core/extend/theme/utsukta-themes/${THEME_SLUG}/assets`;

// Where build-sw.mjs writes sw.js — same theme, different deployed path
// (extend/ vs view/ — pre-existing discrepancy, not something this change fixes).
export const SW_OUT_DIR_REL = `../hz-ddev/core/view/theme/${THEME_SLUG}/assets`;
