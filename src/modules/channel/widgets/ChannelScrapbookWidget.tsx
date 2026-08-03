// src/modules/channel/widgets/ChannelScrapbookWidget.tsx
import { For, Show } from "solid-js";
import { posts, loading, streamHandlers } from "../store";
import { FeedPlaceholder } from "@/shared/stream/feedviews/FeedView";
import ScrapbookView from "@/shared/stream/feedviews/ScrapbookView";
import ChannelFeedShell from "./ChannelFeedShell";

function ScrapbookBody() {
  return (
    <Show
      when={!loading()}
      fallback={<For each={Array(5).fill(0)}>{() => <FeedPlaceholder />}</For>}
    >
      <ScrapbookView posts={posts()} handlers={streamHandlers} />
    </Show>
  );
}

export default function ChannelScrapbookWidget() {
  return <ChannelFeedShell body={ScrapbookBody} />;
}
