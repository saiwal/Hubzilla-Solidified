// src/modules/articles/views/SeriesIndexView.tsx
import { Show, For } from "solid-js";
import { useParams, A } from "@solidjs/router";
import { useI18n } from "@/i18n";
import { usePageNick } from "@/shared/store/site-config";
import { createQueryResource } from "@/shared/lib/createQueryResource";
import { fetchSeriesList } from "../api";

export default function SeriesIndexView() {
  const params = useParams<{ nick: string }>();
  const pageNick = usePageNick();
  const nick = () => params.nick || pageNick();
  const { t } = useI18n();

  const [data] = createQueryResource(
    "series-list",
    () => nick(),
    (n) => fetchSeriesList(n),
  );

  return (
    <div class="space-y-6 max-w-2xl mx-auto">
      <A
        href={`/articles/${nick()}`}
        class="inline-flex items-center gap-1 text-sm text-muted hover:text-txt transition-colors"
      >
        {t("articles.all_articles")}
      </A>

      <h1 class="text-xl font-bold text-txt">{t("articles.series_index_title")}</h1>

      <Show when={!data.loading}>
        <Show
          when={(data() ?? []).length > 0}
          fallback={<p class="text-sm text-muted py-8 text-center">{t("articles.series_no_series")}</p>}
        >
          <div class="space-y-2">
            <For each={data()}>
              {(series) => (
                <A
                  href={`/articles/${nick()}/series/${encodeURIComponent(series.name)}`}
                  class="flex items-center justify-between gap-3 bg-surface border border-rim rounded-xl
                         px-4 py-3 hover:border-rim-strong hover:bg-elevated transition-colors"
                >
                  <span class="text-sm font-medium text-txt">{series.name}</span>
                  <span class="text-xs text-muted">{t("articles.series_articles_count", { count: series.count })}</span>
                </A>
              )}
            </For>
          </div>
        </Show>
      </Show>
    </div>
  );
}
