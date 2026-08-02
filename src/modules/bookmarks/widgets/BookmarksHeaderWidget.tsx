import { Show } from "solid-js";
import { createQueryResource } from "@/shared/lib/createQueryResource";
import { useI18n } from "@/i18n";
import { fetchAllBookmarks, type BookmarkMenu } from "../api";

export default function BookmarksHeaderWidget() {
  const { t } = useI18n();
  const [menus] = createQueryResource<BookmarkMenu[]>("bookmarks", fetchAllBookmarks, {
    initialValue: [],
  });
  const totalCount = () => (menus() ?? []).reduce((s, m) => s + m.items.length, 0);

  return (
    <div class="max-w-2xl mx-auto flex items-center gap-3">
      <svg class="w-5 h-5 text-accent shrink-0" viewBox="0 0 24 24" fill="currentColor">
        <path d="M5 3a2 2 0 00-2 2v16l7-3 7 3V5a2 2 0 00-2-2H5z" />
      </svg>
      <h1 class="text-lg font-semibold text-txt">{t("bookmarks.title")}</h1>
      <Show when={!menus.loading && totalCount() > 0}>
        <span class="text-xs text-muted tabular-nums ml-auto">{totalCount()}</span>
      </Show>
    </div>
  );
}
