import { createSignal, For, Show, onMount } from "solid-js";
import { storageSet } from "@/shared/lib/storage";
import type { SavedDraft } from "../store/createComposerStore";
import { listServerDrafts, deleteServerDraft } from "../api/drafts";
import { MdFillDelete } from "solid-icons/md";

// Shared list UI behind the per-module drafts widgets (articles, webpages,
// wiki, …) — one card with header/skeleton/empty-state/list chrome, fetching
// and deleting drafts of a single scope-type prefix. Each module supplies the
// bits that differ: labels, badge styling/text, which entries are safely
// resumable, and what "load" means for its own composer (open a modal,
// navigate to a routed editor, …).

export type DraftEntry = { scope: string; draft: SavedDraft };

export interface DraftsWidgetApi {
  reload: () => Promise<void>;
}

export interface DraftsWidgetBaseProps {
  /** Scope prefix before the first ":" — also the `listServerDrafts` type filter */
  scopeType: string;
  title: string;
  emptyText: string;
  refreshTitle: string;
  deleteTitle: string;
  untitledText: string;
  emptyDraftText: string;
  /** Tailwind classes for the line-3 type/status badge (constant per widget) */
  badgeClassName: string;
  badgeLabel: (scope: string) => string;
  /** Defaults to always-loadable when omitted */
  isLoadable?: (scope: string) => boolean;
  /** Called (after the pending-draft key is written) when a loadable entry is clicked */
  onLoad: (entry: DraftEntry) => void | Promise<void>;
  /** Escape hatch so a caller that owns a modal can force a refetch after saving */
  apiRef?: (api: DraftsWidgetApi) => void;
}

// Short absolute date — "Jul 30", falling back to a year suffix once it's stale
function formatDate(ms: number): string {
  const d = new Date(ms);
  const opts: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" };
  if (d.getFullYear() !== new Date().getFullYear()) opts.year = "numeric";
  return d.toLocaleDateString(undefined, opts);
}

const SkeletonRow = () => (
  <div class="px-4 py-3 animate-pulse space-y-2">
    <div class="h-3.5 bg-overlay rounded w-2/3" />
    <div class="h-3 bg-overlay rounded w-4/5" />
    <div class="flex items-center justify-between pt-0.5">
      <div class="h-3.5 w-10 bg-overlay rounded" />
      <div class="h-3 w-10 bg-overlay rounded" />
    </div>
  </div>
);

export default function DraftsWidgetBase(props: DraftsWidgetBaseProps) {
  const [entries, setEntries] = createSignal<DraftEntry[]>([]);
  const [loading, setLoading] = createSignal(true);
  const [deleting, setDeleting] = createSignal<string | null>(null);

  const loadable = (scope: string) => (props.isLoadable ? props.isLoadable(scope) : true);

  async function loadAll() {
    setLoading(true);
    try {
      const serverDrafts = await listServerDrafts(props.scopeType);
      const results = serverDrafts
        .filter((sd) => sd.scope.split(":")[0] === props.scopeType)
        .map((sd) => ({ scope: sd.scope, draft: { ...sd, id: sd.serverMid } }));
      results.sort((a, b) => b.draft.updated - a.draft.updated);
      setEntries(results);
    } finally {
      setLoading(false);
    }
  }

  onMount(() => {
    void loadAll();
    props.apiRef?.({ reload: loadAll });
  });

  async function deleteDraft(scope: string, id: string) {
    setDeleting(id);
    try {
      void deleteServerDraft(id); // id === serverMid for server-only drafts
      setEntries((prev) => prev.filter((e) => !(e.scope === scope && e.draft.id === id)));
    } finally {
      setDeleting(null);
    }
  }

  async function handleLoad(entry: DraftEntry) {
    await storageSet(`pending-draft:${entry.scope}`, entry.draft);
    await props.onLoad(entry);
  }

  return (
    <div class="bg-surface border border-rim rounded-2xl shadow-sm flex flex-col overflow-hidden">

      {/* Header */}
      <div class="px-4 pt-3.5 pb-3 flex items-center justify-between shrink-0">
        <div class="flex items-center gap-2">
          <svg class="w-4 h-4 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8"
              d="M5 5a2 2 0 012-2h7l5 5v11a2 2 0 01-2 2H7a2 2 0 01-2-2V5z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8"
              d="M15 3v5H9V3m0 14h6" />
          </svg>
          <h3 class="text-sm font-semibold text-txt">{props.title}</h3>
        </div>
        <div class="flex items-center gap-2">
          <Show when={!loading() && entries().length > 0}>
            <span class="text-xs text-muted tabular-nums">{entries().length}</span>
          </Show>
          {/* Refresh */}
          <button
            type="button"
            title={props.refreshTitle}
            onClick={() => void loadAll()}
            disabled={loading()}
            class="p-0.5 rounded text-muted hover:text-txt transition-colors disabled:opacity-40"
          >
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"
              classList={{ "animate-spin": loading() }}>
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003
                   8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
      </div>

      {/* Loading skeletons */}
      <Show when={loading()}>
        <For each={[1, 2]}>{() => <SkeletonRow />}</For>
      </Show>

      {/* Empty state */}
      <Show when={!loading() && entries().length === 0}>
        <div class="px-4 py-6 flex flex-col items-center gap-2 text-muted">
          <svg class="w-8 h-8 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
              d="M5 5a2 2 0 012-2h7l5 5v11a2 2 0 01-2 2H7a2 2 0 01-2-2V5z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
              d="M15 3v5H9V3m0 14h6" />
          </svg>
          <span class="text-xs">{props.emptyText}</span>
        </div>
      </Show>

      {/* Draft list */}
      <Show when={!loading()}>
        <div class="divide-y divide-rim">
          <For each={entries()}>
            {(entry) => {
              const isDeleting = () => deleting() === entry.draft.id;
              const canLoad = () => loadable(entry.scope);

              return (
                <div class="px-4 py-3 hover:bg-elevated group transition-colors"
                  classList={{ "opacity-50 pointer-events-none": isDeleting() }}>

                  {/* Line 1 + 2 — title & summary */}
                  <div
                    class={canLoad() ? "cursor-pointer" : ""}
                    onClick={() => { if (canLoad()) void handleLoad(entry); }}
                  >
                    <p class="text-sm font-medium text-txt truncate leading-snug">
                      <Show when={entry.draft.title} fallback={<em class="font-normal text-muted">{props.untitledText}</em>}>
                        {entry.draft.title}
                      </Show>
                    </p>
                    <p class="text-xs text-muted truncate mt-0.5">
                      <Show when={entry.draft.preview} fallback={<em>{props.emptyDraftText}</em>}>
                        {entry.draft.preview}
                      </Show>
                    </p>
                  </div>

                  {/* Line 3 — badge · delete · date (right-aligned) */}
                  <div class="flex items-center justify-between mt-1.5">
                    <span class={`shrink-0 text-[0.625rem] font-semibold px-1.5 py-0.5 rounded
                                  border leading-none select-none ${props.badgeClassName}`}>
                      {props.badgeLabel(entry.scope)}
                    </span>
                    <div class="flex items-center gap-2.5">
                      <button
                        type="button"
                        title={props.deleteTitle}
                        onClick={() => void deleteDraft(entry.scope, entry.draft.id)}
                        class="p-0.5 -m-0.5 rounded text-muted/70 opacity-100 md:opacity-0 md:group-hover:opacity-100
                               hover:text-red-500 focus-visible:opacity-100 transition-all"
                      >
                        <Show
                          when={!isDeleting()}
                          fallback={
                            <svg class="w-3 h-3 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0
                                   0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                          }
                        >
                          <MdFillDelete size={12} />
                        </Show>
                      </button>
                      <span
                        class="text-[0.625rem] text-muted/60 tabular-nums shrink-0"
                        title={new Date(entry.draft.created).toLocaleString()}
                      >
                        {formatDate(entry.draft.created)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            }}
          </For>
        </div>
      </Show>
    </div>
  );
}
