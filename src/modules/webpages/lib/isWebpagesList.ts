import { useLocation } from "@solidjs/router";

// The webpages module shares one moduleId across the page list, the editor
// (new/edit), the menus manager, the layout-templates manager, and even
// rendered comanche pages at /page/:nick/*path — Layout.tsx's <Slot
// moduleId> only knows the module, not which route is active, so the
// module-default header/content widgets must hide themselves outside the
// plain list route.
export function useIsWebpagesList(): () => boolean {
  const location = useLocation();
  return () => {
    const parts = location.pathname.split("/").filter(Boolean);
    return parts[0] === "webpages" && parts.length <= 2; // /webpages or /webpages/:nick only
  };
}
