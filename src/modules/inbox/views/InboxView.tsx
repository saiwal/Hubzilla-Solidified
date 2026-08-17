// Mailbox over the local message store: a settings-style section nav (see
// SubPageLayout / SettingsView) listing the feeds and the user's file folders,
// with HQ's message list as the detail pane. The list reads through
// message-store.ts, so it renders from IndexedDB when there's no network.
// Reading a message reuses PostDetailModal, opened by MessageList itself.
import { createSignal, createMemo, onMount, onCleanup, type Component } from "solid-js";
import { Show } from "solid-js";
import { useLocation } from "@solidjs/router";
import { useI18n } from "@utsukta/spa-core/i18n";
import { useOnlineStatus } from "@utsukta/spa-core/lib/useOnlineStatus";
import { createQueryResource } from "@utsukta/spa-core/lib/createQueryResource";
import { syncInbox, setInboxActive } from "@utsukta/spa-core/lib/message-store";
import SubPageLayout, { type SubPageItem } from "@/shared/views/SubPageLayout";
import { fetchFolders } from "@/modules/network/api";
import {
  MessageList,
  TYPE_ICON_PATH,
  FOLDER_ICON_PATH,
  FEED_META,
  type FeedType,
  type MessageType,
} from "@/modules/hq/widgets/MessageList";

const FOLDER_PREFIX = "folder/";

// Section key → the feed the message list should show. Keys are URL segments
// under /inbox; folders get their own "folder/<name>" keys built at runtime.
const FEED_SECTIONS: { key: string; type: MessageType }[] = [
  { key: "all", type: "" },
  { key: "direct", type: "direct" },
  { key: "starred", type: "starred" },
  { key: "notices", type: "notification" },
];

const Icon: Component<{ path: string }> = (props) => (
  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d={props.path} />
  </svg>
);

export default function InboxView() {
  const { t } = useI18n();
  const location = useLocation();
  const online = useOnlineStatus();

  const [search, setSearch] = createSignal("");
  const [reloadKey, setReloadKey] = createSignal(0);

  const [folders] = createQueryResource<string[]>("inbox-folders", fetchFolders, {
    initialValue: [],
  });

  // Syncing a large mailbox is minutes of background requests, so it belongs
  // to this module alone: it starts when the inbox is opened and the flag stops
  // body warming again as soon as you navigate away. syncInbox itself throttles
  // repeat runs, so moving between sections doesn't re-walk every feed.
  onMount(() => {
    setInboxActive(true);
    void syncInbox();
  });
  onCleanup(() => setInboxActive(false));

  const activeKey = createMemo(
    () => location.pathname.replace(/^\/inbox\/?/, "").replace(/\/$/, "") || "all",
  );

  const selection = createMemo<{ type: FeedType; file: string }>(() => {
    const key = activeKey();
    if (key.startsWith(FOLDER_PREFIX))
      return { type: "folder", file: decodeURIComponent(key.slice(FOLDER_PREFIX.length)) };
    return { type: FEED_SECTIONS.find((s) => s.key === key)?.type ?? "", file: "" };
  });

  const items = createMemo<SubPageItem[]>(() => [
    ...FEED_SECTIONS.map((s, i) => ({
      path: s.key,
      label: () => t(FEED_META[s.type].titleKey as Parameters<typeof t>[0]) as string,
      icon: <Icon path={TYPE_ICON_PATH[s.type]} />,
      dividerAfter: i === FEED_SECTIONS.length - 1,
    })),
    ...(folders() ?? []).map((name) => ({
      path: `${FOLDER_PREFIX}${encodeURIComponent(name)}`,
      label: name,
      icon: <Icon path={FOLDER_ICON_PATH} />,
    })),
  ]);

  function refresh() {
    void syncInbox(true);
    setReloadKey((n) => n + 1);
  }

  return (
    <SubPageLayout
      base="/inbox"
      items={items()}
      activeKey={activeKey()}
      contentClass="flex-1 min-w-0 flex flex-col"
    >
      {/* Bounded height: MessageList scrolls its own body and paginates on
          scroll, so it needs a container that doesn't grow with its content. */}
      <div class="flex flex-col h-[calc(100dvh-12rem)] min-h-[20rem]">
        <div class="px-4 py-2 shrink-0 flex items-center gap-2 border-b border-rim">
          <Show when={!online()}>
            <span class="text-[0.625rem] px-1.5 py-0.5 rounded-md bg-overlay text-muted shrink-0">
              {t("layout.offline")}
            </span>
          </Show>

          <div class="flex-1" />

          <input
            type="search"
            value={search()}
            onInput={(e) => setSearch(e.currentTarget.value)}
            placeholder={t("hq.filter_placeholder")}
            class="w-28 sm:w-44 text-xs bg-overlay border-0 rounded-lg px-2.5 py-1.5
              text-txt placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent"
          />

          <button
            type="button"
            onClick={refresh}
            title={t("hq.refresh")}
            class="w-7 h-7 flex items-center justify-center rounded-md text-muted hover:bg-overlay hover:text-txt"
          >
            <Icon path="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </button>
        </div>

        <MessageList
          type={selection().type}
          file={selection().file}
          authorFilter={search()}
          reloadKey={reloadKey()}
        />
      </div>
    </SubPageLayout>
  );
}
