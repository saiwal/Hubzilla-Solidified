// The doc body (article + search results + TOC) is registered as the
// help.content widget in ../index.ts (contentTop slot) and rendered by
// Layout.tsx's <Slot .../> around this view — see hq/views/HqView.tsx for
// the same pattern. Unlike other modules, there's no new header widget
// here: help.chooser (section tabs + search box) already defaults into the
// header slot and fills that role.
export default function HelpView() {
  return null;
}
