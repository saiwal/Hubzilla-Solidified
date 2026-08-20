import { useI18n } from "@utsukta/spa-core/i18n";
import { createSignal, Show, lazy } from "solid-js";
import { MdOutlineEdit, MdOutlineRefresh } from "solid-icons/md";
import { useAuth } from "@utsukta/spa-core/store/auth-store";
import PostComposer from "@/shared/editor/composers/PostComposer";
import { MessageList, FolderViewToggle, loadFolderViewMode, saveFolderViewMode, type ViewMode } from "./MessageList";

const HqFoldersWidget = lazy(() => import("./HqFoldersWidget"));

type Tab = "all" | "folders";

// The dashboard's main message card. "All" is the live feed; "Folders"
// combines file-tag folders with a pinned "Starred" entry (see
// HqFoldersWidget.tsx). Direct messages and notices stay separate, opt-in
// widgets (HqDirectMessagesWidget.tsx / HqNoticesWidget.tsx).
//
// The tab bar and each tab's controls (compose/refresh/filter for "All",
// list/grid toggle for "Folders") share a single header row instead of
// stacking as separate rows.
export default function HqMessagesWidget() {
  const { t } = useI18n();
  const auth = useAuth();
  const [tab, setTab] = createSignal<Tab>("all");

  const [authorFilter, setAuthorFilter] = createSignal("");
  const [showCompose, setShowCompose] = createSignal(false);
  const [reloadKey, setReloadKey] = createSignal(0);
  const [refreshing, setRefreshing] = createSignal(false);
  const [viewMode, setViewMode] = createSignal<ViewMode>(loadFolderViewMode());

  let filterTimer: ReturnType<typeof setTimeout>;
  function onFilterInput(val: string) {
    clearTimeout(filterTimer);
    filterTimer = setTimeout(() => setAuthorFilter(val), 300);
  }

  function changeViewMode(mode: ViewMode) {
    setViewMode(mode);
    saveFolderViewMode(mode);
  }

  return (
    <div
      data-tour="hq.messages"
      class="bg-surface rounded-2xl border border-rim flex flex-col overflow-hidden shadow-sm"
      style={{ "max-height": "480px" }}
    >
      <div class="px-2.5 pt-2.5 pb-1.5 shrink-0 flex items-center justify-between gap-2 border-b border-rim">
        <div class="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={() => setTab("all")}
            class="px-2.5 py-1.5 text-xs font-medium rounded-t-lg transition-colors border-b-2 -mb-px"
            classList={{
              "text-txt border-accent": tab() === "all",
              "text-muted border-transparent hover:text-txt": tab() !== "all",
            }}
          >
            {t("hq.msg_tab_all")}
          </button>
          <button
            type="button"
            onClick={() => setTab("folders")}
            class="px-2.5 py-1.5 text-xs font-medium rounded-t-lg transition-colors border-b-2 -mb-px"
            classList={{
              "text-txt border-accent": tab() === "folders",
              "text-muted border-transparent hover:text-txt": tab() !== "folders",
            }}
          >
            {t("hq.msg_tab_folders")}
          </button>
        </div>

        <div class="flex items-center gap-1 min-w-0">
          <Show when={tab() === "all"}>
            <Show when={!auth.loading && auth()?.uid}>
              <button
                type="button"
                title={t("hq.new_post")}
                onClick={() => setShowCompose(true)}
                class="w-6 h-6 flex items-center justify-center rounded-md text-muted
                       hover:bg-overlay hover:text-txt transition-colors shrink-0"
              >
                <MdOutlineEdit size={14} />
              </button>
            </Show>

            <button
              type="button"
              title={t("hq.refresh")}
              onClick={() => setReloadKey((k) => k + 1)}
              disabled={refreshing()}
              class="w-6 h-6 flex items-center justify-center rounded-md text-muted
                     hover:bg-overlay hover:text-txt transition-colors disabled:opacity-50 shrink-0"
            >
              <MdOutlineRefresh size={14} class={refreshing() ? "animate-spin" : ""} />
            </button>

            <div class="relative min-w-0">
              <svg
                class="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted pointer-events-none"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <input
                type="text"
                placeholder={t("hq.filter_placeholder")}
                class="w-24 text-xs bg-overlay border-0 rounded-lg
                       pl-7 pr-3 py-1 text-txt placeholder-muted
                       focus:outline-none focus:ring-2 focus:ring-accent/40
                       transition-all duration-200 focus:w-32"
                onInput={(e) => onFilterInput(e.currentTarget.value)}
              />
            </div>
          </Show>

          <Show when={tab() === "folders"}>
            <FolderViewToggle mode={viewMode()} onChange={changeViewMode} />
          </Show>
        </div>
      </div>

      <div class="flex-1 flex flex-col overflow-hidden">
        <Show when={tab() === "all"}>
          <MessageList
            type=""
            authorFilter={authorFilter()}
            reloadKey={reloadKey()}
            onRefreshingChange={setRefreshing}
          />
        </Show>
        <Show when={tab() === "folders"}>
          <HqFoldersWidget viewMode={viewMode()} />
        </Show>
      </div>

      <Show when={showCompose() && !auth.loading && auth()?.uid}>
        <PostComposer
          profileUid={auth()!.uid}
          open={true}
          onPosted={() => setShowCompose(false)}
          onClose={() => setShowCompose(false)}
        />
      </Show>
    </div>
  );
}
