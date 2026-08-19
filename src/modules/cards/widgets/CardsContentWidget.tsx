// The card board: a masonry pinboard rather than the chronological list the
// articles module uses, since cards are peers with no reading order.
//
// Masonry is CSS multi-column, not a grid or a virtualiser. `columns-*` packs
// items of unequal height with no dead space and needs no measurement pass.
// ponytail: deliberately unvirtualised at v1 — masonry and virtualisation
// don't compose (a virtualiser needs to know row heights that the column
// packer decides), and the store's own pagination caps what's mounted. Revisit
// only if a board of many hundreds of cards is a real workload.

import { createEffect, onCleanup, Show, For } from "solid-js";
import { MdOutlineStyle } from "solid-icons/md";
import { useI18n } from "@utsukta/spa-core/i18n";
import { useAuth } from "@utsukta/spa-core/store/auth-store";
import { usePageNick } from "@utsukta/spa-core/store/site-config";
import { posts, loading, hasMore, loadCards, resetPosts, loadMore } from "../store";
import CardFace from "../components/CardFace";
import { useIsCardsList } from "../lib/isCardsList";

function CardsBoardSkeleton() {
  return (
    <div class="columns-1 sm:columns-2 lg:columns-3 gap-4">
      <For each={Array(6).fill(0)}>
        {() => <div class="break-inside-avoid mb-4 h-64 rounded-2xl bg-elevated animate-pulse" />}
      </For>
    </div>
  );
}

export default function CardsContentWidget() {
  const auth = useAuth();
  const { t } = useI18n();
  const nick = usePageNick();
  const isList = useIsCardsList();
  let initialized = false;

  createEffect(() => {
    if (auth.loading) return;
    if (initialized) return;
    initialized = true;
    resetPosts();
    loadCards(nick());
  });

  onCleanup(() => resetPosts());

  return (
    <Show when={isList()}>
      <div class="space-y-4 max-w-5xl mx-auto">
        <Show when={!loading()} fallback={<CardsBoardSkeleton />}>
          <Show
            when={posts().length > 0}
            fallback={
              <div class="text-center py-16 text-muted text-sm space-y-2">
                <MdOutlineStyle class="text-2xl text-muted mx-auto" />
                <p>{t("cards.no_cards")}</p>
              </div>
            }
          >
            <div class="columns-1 sm:columns-2 lg:columns-3 gap-4">
              <For each={posts()}>
                {(post) => (
                  <div class="break-inside-avoid mb-4">
                    <CardFace card={post} nick={nick()} canEmbed={!!auth()?.isLocal} />
                  </div>
                )}
              </For>
            </div>

            <Show when={hasMore()}>
              <div class="flex justify-center pt-2">
                <button
                  onClick={loadMore}
                  class="px-4 py-2 text-sm font-medium rounded-lg border border-rim
                         bg-surface text-muted hover:bg-elevated transition-colors"
                >
                  {t("cards.load_more")}
                </button>
              </div>
            </Show>

            <Show when={!hasMore()}>
              <p class="text-center py-2 text-xs text-muted">{t("cards.all_loaded")}</p>
            </Show>
          </Show>
        </Show>
      </div>
    </Show>
  );
}
