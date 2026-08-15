import { createSignal } from "solid-js";

// Global — lets the RSS nav icon (NavUtilities.tsx) open the feed-subscribe
// modal from wherever the user currently is. Watched by FeedModalHost,
// mounted once in Layout.tsx alongside the other always-on overlays
// (ToastContainer, HelpOverlay, ConnectionRequestModalHost).
const [feedModalNick, setFeedModalNick] = createSignal<string | null>(null);

export function openFeedModal(nick: string): void {
  setFeedModalNick(nick);
}

export function useFeedModal() {
  return [feedModalNick, setFeedModalNick] as const;
}
