// src/modules/help/views/HelpView.tsx
import { createEffect, Show, For } from "solid-js";
import { createQueryResource } from "@/shared/lib/createQueryResource";
import { useParams, useSearchParams, A } from "@solidjs/router";
import DOMPurify from "dompurify";
import { useI18n } from "@/i18n";
import { useToc } from "@/shared/lib/useToc";
import ArticleToc from "@/shared/views/ArticleToc";
import { fetchTopic, fetchHelpSearch } from "../api";

// ── Skeleton ──────────────────────────────────────────────────────────────────

function ContentSkeleton() {
  return (
    <div class="space-y-4 animate-pulse flex-1">
      <div class="h-7 bg-elevated rounded w-1/2" />
      <div class="space-y-2">
        <For each={Array(12).fill(0)}>
          {() => (
            <div
              class="h-3 bg-elevated rounded"
              style={{ width: `${50 + Math.random() * 50}%` }}
            />
          )}
        </For>
      </div>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────

export default function HelpView() {
  const { t } = useI18n();
  // Route: /help/*rest → rest = "section/...topic" (no lang in URL)
  const params = useParams<{ rest: string }>();
  const { locale } = useI18n();
  const [searchParams] = useSearchParams();

  const parts = () => (params.rest ?? "").split("/").filter(Boolean);
  const section = () => parts()[0] || "user";
  const topic = () => parts().slice(1).join("/");
  // Use app locale as doc lang; PHP falls back to any available lang if not found
  const lang = () => locale().split("-")[0]; // "en-US" → "en"

  const query = () => {
    const v = searchParams.q;
    return v ? String(Array.isArray(v) ? v[0] : v) : "";
  };

  // Skip the topic fetch while a search is active — its content isn't shown.
  const [topicData] = createQueryResource(
    "help-topic",
    () => (query() ? null : { section: section(), lang: lang(), topic: topic() }),
    ({ section, lang, topic }) => fetchTopic(section, lang, topic),
  );

  const [searchData] = createQueryResource(
    "help-search",
    () => (query() ? { section: section(), lang: lang(), q: query() } : null),
    ({ section, lang, q }) => fetchHelpSearch(section, lang, q),
  );

  const rendered = () =>
    topicData()?.html ? DOMPurify.sanitize(topicData()!.html) : "";

  // TOC
  let bodyRef: HTMLDivElement | undefined;
  const { toc, activeId, setToc, setActiveId } = useToc(rendered, () => bodyRef);

  // Clear TOC whenever the route changes so stale entries don't linger
  createEffect(() => {
    section();
    topic();
    query(); // track all three
    setToc([]);
    setActiveId("");
  });

  return (
    <div class="relative max-w-5xl mx-auto py-4">
      <div class="xl:flex xl:gap-8">
        {/* ── Content ── */}
        <article class="min-w-0 flex-1 max-w-none xl:max-w-3xl space-y-5">
          <Show
            when={!query()}
            fallback={
              <>
                <h1 class="text-lg font-semibold text-txt">
                  {t("help.results_for", { query: query() })}
                </h1>

                <Show when={searchData.loading}>
                  <ContentSkeleton />
                </Show>

                <Show when={!searchData.loading}>
                  <Show
                    when={(searchData()?.results.length ?? 0) > 0}
                    fallback={<p class="text-sm text-muted">{t("help.no_results")}</p>}
                  >
                    <ul class="space-y-3">
                      <For each={searchData()!.results}>
                        {(r) => (
                          <li>
                            <A
                              href={`/help/${section()}/${r.path}`}
                              class="block bg-surface border border-rim rounded-xl p-4
                                     hover:border-rim-strong hover:bg-elevated transition-colors"
                            >
                              <div class="text-sm font-semibold text-accent">{r.title}</div>
                              <p class="text-xs text-muted mt-1">{r.snippet}</p>
                            </A>
                          </li>
                        )}
                      </For>
                    </ul>
                  </Show>
                </Show>
              </>
            }
          >
            <Show when={topicData.loading}>
              <ContentSkeleton />
            </Show>

            <Show when={topicData.error}>
              <div class="bg-surface border border-rim rounded-xl p-8 text-center space-y-3">
                <p class="text-sm text-red-500">
                  {topicData.error?.message ?? "Page not found."}
                </p>
                <A
                  href={`/help/${section()}`}
                  class="text-sm text-accent hover:underline"
                >
                  ← Back
                </A>
              </div>
            </Show>

            <Show when={!topicData.loading && topicData()}>
              <>
                {/* Body */}
                <div
                  ref={bodyRef}
                  class="prose dark:prose-invert max-w-none
                         prose-a:text-accent prose-a:no-underline hover:prose-a:underline
                         prose-blockquote:not-italic prose-blockquote:border-accent
                         prose-code:bg-overlay prose-code:px-1 prose-code:rounded prose-code:text-sm
                         prose-code:before:content-none prose-code:after:content-none
                         prose-img:rounded-lg break-words"
                  innerHTML={rendered()}
                />
              </>
            </Show>
          </Show>
        </article>

        {/* ── TOC — fixed sidebar on xl+, floating collapsed launcher below xl ── */}
        <Show when={!query()}>
          <ArticleToc entries={toc()} activeId={activeId()} label={t("help.on_this_page")} />
        </Show>
      </div>
    </div>
  );
}
