import { render } from "solid-js/web";
import "./index.css";
import App from "./App";
import { loadTypography } from "@utsukta/spa-core/lib/typography";
import { loadBackground } from "@utsukta/spa-core/lib/background";
import { loadCornerRadius } from "@utsukta/spa-core/lib/corner-radius";
import { applyTheme } from "@utsukta/spa-core/lib/useTheme";
import { installOfflineFallback } from "@utsukta/spa-core/lib/offline-fallback";
import type { ThemeId } from "@utsukta/spa-core/types/theme.types";

// Before anything can issue a request.
installOfflineFallback();

// applyTheme, not a bare data-theme attribute: "custom" has no stylesheet rule
// of its own, so it needs its <style> injected here or the page paints with the
// light defaults until the settings fetch lands.
applyTheme((localStorage.getItem("hz-theme") as ThemeId) ?? "light");

loadTypography();
loadBackground();
loadCornerRadius();

render(() => <App />, document.getElementById("root")!);
