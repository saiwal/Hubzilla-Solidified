// The title/search/new-card bar and the card board are registered as
// widgets in ../index.ts (header / contentTop slots) and rendered by
// Layout.tsx's <Slot .../> around this view — see hq/views/HqView.tsx for
// the same pattern. Both widgets self-hide outside the board route (see
// ../lib/isCardsList.ts) since this module's other routes (deck,
// card detail) render their own real content here instead.
export default function CardsView() {
  return null;
}
