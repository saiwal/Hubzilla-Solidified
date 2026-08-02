import { useLocation } from "@solidjs/router";

// The chat module shares one moduleId across the rooms list (/chat/:nick)
// and an individual room (/chat/:nick/:roomId) — Layout.tsx's <Slot
// moduleId> only knows the module, not which route is active, so the
// module-default header/content widgets must hide themselves on a room
// page, which renders its own real content instead.
export function useIsChatRoomsList(): () => boolean {
  const location = useLocation();
  return () => {
    const parts = location.pathname.split("/").filter(Boolean);
    return parts[0] === "chat" && parts.length <= 2; // /chat or /chat/:nick only
  };
}
