import { createSignal } from "solid-js";

// Global — lets a connection-request notification open the accept/reject
// modal from wherever the user currently is, instead of navigating to the
// connections list. Watched by ConnectionRequestModalHost, mounted once in
// Layout.tsx alongside the other always-on overlays (ToastContainer, HelpOverlay).
const [requestedAbookId, setRequestedAbookId] = createSignal<number | null>(null);

export function openConnectionRequestModal(abookId: number): void {
  setRequestedAbookId(abookId);
}

export function useConnectionRequestModal() {
  return [requestedAbookId, setRequestedAbookId] as const;
}
