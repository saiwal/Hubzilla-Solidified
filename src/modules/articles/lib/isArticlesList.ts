import { useLocation } from "@solidjs/router";

// The articles module shares one moduleId across several distinct routed
// views (list, series index, series detail, article detail) — Layout.tsx's
// <Slot moduleId> only knows the module, not which route is active, so the
// module-default header/content widgets must hide themselves outside the
// list route or they'd render on top of the series/article views' own
// content too.
export function useIsArticlesList(): () => boolean {
  const location = useLocation();
  return () => {
    const parts = location.pathname.split("/").filter(Boolean);
    return parts[0] === "articles" && parts.length <= 2; // /articles or /articles/:nick only
  };
}
