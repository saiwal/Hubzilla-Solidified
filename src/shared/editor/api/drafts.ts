import { createSignal } from "solid-js";
import { apiFetch } from "@utsukta/spa-core/lib/fetch";
import type { SavedDraft } from "../store/createComposerStore";

export type ServerDraft = SavedDraft & { serverMid: string; scope: string };

// Bumped whenever a draft is deleted server-side (draft published, or removed
// from a list) so any mounted drafts widget can refetch — the composer that
// deletes a draft (createComposerStore.submit, WikiPageView.handleSave, a
// list's own delete button) is rarely the same component instance as a
// sidebar drafts widget left mounted on the same routed page.
export const [draftsVersion, bumpDraftsVersion] = createSignal(0);

export async function listServerDrafts(type = "post"): Promise<ServerDraft[]> {
  try {
    const res = await apiFetch(`/spa/drafts?type=${encodeURIComponent(type)}`);
    if (!res.ok) return [];
    const json = await res.json();
    return (json.data ?? []) as ServerDraft[];
  } catch {
    return [];
  }
}

export async function saveServerDraft(
  draft: SavedDraft,
  scope: string,
): Promise<string | null> {
  try {
    // mid goes in the body, never in the URL path (full URLs contain slashes)
    const url = draft.serverMid ? "/spa/drafts/update" : "/spa/drafts";
    const res = await apiFetch(url, {
      method: "POST",
      body: JSON.stringify({
        mid: draft.serverMid ?? null,
        body: draft.body,
        title: draft.title,
        summary: draft.summary,
        mimetype: draft.mimetype,
        slug: draft.slug,
        category: draft.category,
        extra: draft.extra ?? null,
        scope,
      }),
    });
    if (!res.ok) return null;
    const json = await res.json();
    return (json.data?.mid ?? null) as string | null;
  } catch {
    return null;
  }
}

export async function deleteServerDraft(serverMid: string): Promise<void> {
  try {
    await apiFetch("/spa/drafts/delete", {
      method: "POST",
      body: JSON.stringify({ mid: serverMid }),
    });
    bumpDraftsVersion((v) => v + 1);
  } catch {
    // silent
  }
}
