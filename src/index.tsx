import { render } from "solid-js/web";
import "./index.css";
import App from "./App";
import { loadTypography } from "@utsukta/spa-core/lib/typography";
import { loadBackground } from "@utsukta/spa-core/lib/background";
import { loadCornerRadius } from "@utsukta/spa-core/lib/corner-radius";
import { DARK_THEMES } from "@utsukta/spa-core/lib/useTheme";
import { installOfflineFallback } from "@utsukta/spa-core/lib/offline-fallback";
import type { ThemeId } from "@utsukta/spa-core/types/theme.types";

// Before anything can issue a request.
installOfflineFallback();

const saved = (localStorage.getItem("hz-theme") as ThemeId) ?? "light";
document.documentElement.setAttribute("data-theme", saved);
document.documentElement.classList.toggle("dark", DARK_THEMES.has(saved));

loadTypography();
loadBackground();
loadCornerRadius();

render(() => <App />, document.getElementById("root")!);
