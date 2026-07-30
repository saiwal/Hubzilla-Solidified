// ArticleSeriesWidget.tsx
// API: GET /spa/stream-widgets/series?channel_nick=<nick>&type=articles
//
// Unlike the category/tag widgets (which filter the current list in place),
// clicking a series navigates to its dedicated series page — a series is an
// ordered sequence, not a facet of the current list.

import { For, Show } from "solid-js";
import { A } from "@solidjs/router";
import { useI18n } from "@/i18n";
import { usePageNick } from "@/shared/store/site-config";
import { createQueryResource } from "@/shared/lib/createQueryResource";

interface SeriesItem {
  name: string;
  count: number;
}

async function fetchSeries(nick: string): Promise<SeriesItem[]> {
  const url = new URL("/spa/stream-widgets/series", window.location.origin);
  url.searchParams.set("channel_nick", nick);
  url.searchParams.set("type", "articles");
  const res = await fetch(url.toString());
  if (!res.ok) return [];
  const json = await res.json();
  return json.data?.series ?? [];
}

export default function ArticleSeriesWidget() {
  const { t } = useI18n();
  const nick = usePageNick();

  const [data] = createQueryResource(
    "stream-series",
    () => nick(),
    (n) => fetchSeries(n),
  );

  return (
    <div class="bg-surface border border-rim rounded-xl overflow-hidden">
      <div class="px-4 py-3 border-b border-rim">
        <h3 class="text-sm font-semibold text-txt">{t("widgets.article_series")}</h3>
      </div>

      <Show when={!data.loading}>
        <Show
          when={(data() ?? []).length > 0}
          fallback={<p class="px-4 py-3 text-xs text-muted">{t("articles.series_no_series")}</p>}
        >
          <ul class="divide-y divide-rim">
            <For each={data()}>
              {(series) => (
                <li>
                  <A
                    href={`/articles/${nick()}/series/${encodeURIComponent(series.name)}`}
                    class="w-full px-4 py-2.5 flex items-center gap-2 text-left hover:bg-elevated transition-colors group"
                  >
                    <span class="flex-1 text-sm truncate text-txt group-hover:text-accent transition-colors">
                      {series.name}
                    </span>
                    <span class="text-xs text-muted shrink-0">{series.count}</span>
                  </A>
                </li>
              )}
            </For>
          </ul>
        </Show>
      </Show>
    </div>
  );
}
