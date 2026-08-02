// The title and the breadcrumb/toolbar/file-list/modals are registered as
// widgets in ../index.ts (header / contentTop slots) and rendered by
// Layout.tsx's <Slot .../> around this view — see hq/views/HqView.tsx for
// the same pattern. As with calendar/pubstream, the header here is a
// static title only — the breadcrumb is itself derived from the same
// client-side navStack the file list needs, so splitting it into a
// separate widget would require lifting that state into a store (this
// module has none today), so everything else stays together in
// FilesContentWidget.
export default function FilesView() {
  return null;
}
