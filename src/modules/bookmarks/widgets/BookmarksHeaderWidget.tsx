import { Show } from "solid-js";
import { createQueryResource } from "@utsukta/spa-core/lib/createQueryResource";
import { useI18n } from "@utsukta/spa-core/i18n";
import { fetchAllBookmarks, type BookmarkMenu } from "../api";

export default function BookmarksHeaderWidget() {
  const { t } = useI18n();
  const [menus] = createQueryResource<BookmarkMenu[]>("bookmarks", fetchAllBookmarks, {
    initialValue: [],
  });
  const totalCount = () => (menus() ?? []).reduce((s, m) => s + m.items.length, 0);

  return (
    <div class="max-w-5xl mx-auto flex items-center gap-3">
       <h1 class="text-lg font-semibold text-txt">{t("bookmarks.title")}</h1>
      <Show when={!menus.loading && totalCount() > 0}>
        <span class="text-xs text-muted tabular-nums ml-auto">{totalCount()}</span>
      </Show>
    </div>
  );
}
