// The title and the tab bar (catalog/cart/orders) + all their content are
// registered as widgets in ../index.ts (header / contentTop slots) and
// rendered by Layout.tsx's <Slot .../> around this view — see
// hq/views/HqView.tsx for the same pattern. As with calendar/pubstream/
// files/photos, the header here is a static title only — the tab bar has
// no separate static title to split out, so it moves into
// CartContentWidget along with everything it switches between.
export default function CartView() {
  return null;
}
