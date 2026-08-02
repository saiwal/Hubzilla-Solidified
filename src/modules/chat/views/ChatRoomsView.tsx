// The title/new-room bar and the room list are registered as widgets in
// ../index.ts (header / contentTop slots) and rendered by Layout.tsx's
// <Slot .../> around this view — see hq/views/HqView.tsx for the same
// pattern. Both widgets self-hide outside the rooms-list route (see
// ../lib/isChatRoomsList.ts) since an individual room (/chat/:nick/:roomId)
// renders its own real content here instead.
export default function ChatRoomsView() {
  return null;
}
