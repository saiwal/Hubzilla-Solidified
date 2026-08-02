// The title/new-wiki bar and the wiki list are registered as widgets in
// ../index.ts (header / contentTop slots) and rendered by Layout.tsx's
// <Slot .../> around this view — see hq/views/HqView.tsx for the same
// pattern. Both widgets self-hide outside the wikis-list route (see
// ../lib/isWikiList.ts) since this module's other routes (a single wiki's
// pages) render their own real content here instead.
export default function WikiListView() {
  return null;
}
