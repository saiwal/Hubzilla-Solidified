// The title and the toolbar+stream are registered as widgets in ../index.ts
// (header / contentTop slots) and rendered by Layout.tsx's <Slot .../>
// around this view — see hq/views/HqView.tsx for the same pattern. Unlike
// notepad/articles/chat, the tag-search state stays entirely inside
// PubstreamContentWidget rather than living in the header — the header here
// is just a title, so there's nothing for it to coordinate with.
export default function PubstreamView() {
  return null;
}
