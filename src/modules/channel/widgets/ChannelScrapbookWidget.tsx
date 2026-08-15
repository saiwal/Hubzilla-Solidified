// src/modules/channel/widgets/ChannelScrapbookWidget.tsx
import { For, Show } from "solid-js";
import { posts, loading, loadingMore, streamHandlers } from "../store";
import ScrapbookView, {
  ScrapbookCardPlaceholder,
  ScrapbookPlaceholder,
} from "@/shared/stream/feedviews/ScrapbookView";
import ChannelFeedShell from "./ChannelFeedShell";

function ScrapbookBody() {
  return (
    <Show when={!loading()} fallback={<ScrapbookPlaceholder />}>
      <ScrapbookView posts={posts()} handlers={streamHandlers} />
      <Show when={loadingMore()}>
        <div class="max-w-6xl mx-auto flex flex-wrap gap-5">
          <For each={Array(4).fill(0)}>{(_, i) => <div class="flex-1 min-w-40"><ScrapbookCardPlaceholder index={i()} /></div>}</For>
        </div>
      </Show>
    </Show>
  );
}

export default function ChannelScrapbookWidget() {
  return <ChannelFeedShell body={ScrapbookBody} />;
}
