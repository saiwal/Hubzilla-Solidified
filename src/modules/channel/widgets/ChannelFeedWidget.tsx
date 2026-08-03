// src/modules/channel/widgets/ChannelFeedWidget.tsx
import { For, Show, Switch, Match } from "solid-js";
import { useI18n } from "@/i18n";
import { useSearchParams } from "@solidjs/router";
import {
  posts,
  loading,
  loadingMore,
  pinnedPosts,
  viewMode,
  changeView,
  streamHandlers,
} from "../store";
import StreamList from "@/shared/stream/feedviews/StreamList";
import { ListPlaceholder } from "@/shared/stream/feedviews/ListView";
import { MasonryPlaceholder } from "@/shared/stream/feedviews/MasonryView";
import { FeedPlaceholder } from "@/shared/stream/feedviews/FeedView";
import { ViewSwitcher } from "@/shared/stream/filters";
import ChannelFeedShell from "./ChannelFeedShell";

function ChannelFeedBody() {
  const { t } = useI18n();
  const [searchParams] = useSearchParams();

  const hasFilters = () =>
    !!(searchParams.search || searchParams.tag || searchParams.cat || searchParams.mid || searchParams.dm === "1");
  // Pinned posts render in their own section above the stream, and are
  // filtered out of the main list to avoid showing twice — but only when no
  // filter is active, so a pinned post that matches a search still shows up
  // in the results like any other post.
  const mainPosts = () => (hasFilters() ? posts() : posts().filter((p) => !p.pinned));
  const showPinnedSection = () => !hasFilters() && pinnedPosts().length > 0;

  return (
    <Show
      when={!loading()}
      fallback={
        <Switch>
          <Match when={viewMode() === "list"}>
            <ListPlaceholder count={8} />
          </Match>
          <Match when={viewMode() === "masonry"}>
            <MasonryPlaceholder count={12} />
          </Match>
          <Match when={true}>
            <For each={Array(5).fill(0)}>{() => <FeedPlaceholder />}</For>
          </Match>
        </Switch>
      }
    >
      <Show when={mainPosts().length === 0 && !showPinnedSection()}>
        <p class="text-sm text-muted py-4 text-center">{t("channel.no_posts")}</p>
      </Show>

      <Show when={showPinnedSection()}>
        <div class="mb-4">
          <StreamList posts={pinnedPosts()} viewMode={viewMode()} handlers={streamHandlers} />
        </div>
      </Show>

      <StreamList
        posts={mainPosts()}
        viewMode={viewMode()}
        handlers={streamHandlers}
        appendingCount={
          loadingMore() && viewMode() === "masonry" ? 6 : undefined
        }
      />

      <Show when={loadingMore() && viewMode() !== "masonry"}>
        <Switch>
          <Match when={viewMode() === "list"}>
            <ListPlaceholder count={4} />
          </Match>
          <Match when={true}>
            <For each={Array(3).fill(0)}>{() => <FeedPlaceholder />}</For>
          </Match>
        </Switch>
      </Show>
    </Show>
  );
}

export default function ChannelFeedWidget() {
  return (
    <ChannelFeedShell
      viewSwitcher={
        <ViewSwitcher
          viewMode={viewMode()}
          onChange={changeView}
          available={["feed", "masonry", "list"]}
        />
      }
      body={ChannelFeedBody}
    />
  );
}
