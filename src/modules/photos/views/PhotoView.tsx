// The title and the album/image browser are registered as widgets in
// ../index.ts (header / contentTop slots) and rendered by Layout.tsx's
// <Slot .../> around this view — see hq/views/HqView.tsx for the same
// pattern. As with calendar/pubstream/files, the header here is a static
// title only — the body (PhotosContentWidget) internally dispatches
// between the album summary, an album grid, and a single image view based
// on the URL, exactly as this component used to. The one real wrinkle: the
// album/image :datum route param isn't reachable via usePageNick outside
// route context, so PhotosContentWidget derives it from the URL directly
// (see its usePhotoDatum() helper) instead of useParams().
export default function PhotoView() {
  return null;
}
