// The title/search/new-article bar and the article list are registered as
// widgets in ../index.ts (header / contentTop slots) and rendered by
// Layout.tsx's <Slot .../> around this view — see hq/views/HqView.tsx for
// the same pattern. Both widgets self-hide outside the list route (see
// ../lib/isArticlesList.ts) since this module's other routes (series,
// article detail) render their own real content here instead.
export default function ArticlesView() {
  return null;
}
