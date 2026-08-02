// The title and the toolbar+view+modals are registered as widgets in
// ../index.ts (header / contentTop slots) and rendered by Layout.tsx's
// <Slot .../> around this view — see hq/views/HqView.tsx for the same
// pattern. As with pubstream, the header here is a static title only —
// the dynamic period label, view switcher, and nav buttons all live in
// CalendarContentWidget instead, since the period label is itself derived
// from the same viewType/anchor state the body needs, so splitting it into
// a separate widget would require lifting that state into the store.
export default function CalView() {
  return null;
}
