import { useLocation } from "@solidjs/router";

// The cards module shares one moduleId across several distinct routed
// views (board, deck index, deck detail, card detail) — Layout.tsx's
// <Slot moduleId> only knows the module, not which route is active, so the
// module-default header/content widgets must hide themselves outside the
// board route or they'd render on top of the deck/card views' own
// content too.
export function useIsCardsList(): () => boolean {
  const location = useLocation();
  return () => {
    const parts = location.pathname.split("/").filter(Boolean);
    return parts[0] === "cards" && parts.length <= 2; // /cards or /cards/:nick only
  };
}
