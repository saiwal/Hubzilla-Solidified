import { useLocation } from "@solidjs/router";

// The wiki module shares one moduleId across the wikis list (/wiki/:nick),
// a redirect shim (/wiki/:nick/:wikiName), and a single wiki page
// (/wiki/:nick/:wikiName/:pageName) — Layout.tsx's <Slot moduleId> only
// knows the module, not which route is active, so the module-default
// header/content widgets must hide themselves outside the plain list route.
export function useIsWikiList(): () => boolean {
  const location = useLocation();
  return () => {
    const parts = location.pathname.split("/").filter(Boolean);
    return parts[0] === "wiki" && parts.length <= 2; // /wiki or /wiki/:nick only
  };
}
