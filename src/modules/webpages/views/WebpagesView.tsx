// The title/action bar and the page list are registered as widgets in
// ../index.ts (header / contentTop slots) and rendered by Layout.tsx's
// <Slot .../> around this view — see hq/views/HqView.tsx for the same
// pattern. Both widgets self-hide outside the plain list route (see
// ../lib/isWebpagesList.ts) since this module's other routes (editor,
// menus, layouts, rendered pages) render their own real content here
// instead.
export default function WebpagesView() {
  return null;
}
