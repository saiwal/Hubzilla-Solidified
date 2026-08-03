// src/modules/channel/widgets/ChannelTimelineWidget.tsx
import { For, Show } from "solid-js";
import { posts, loading, streamHandlers } from "../store";
import { FeedPlaceholder } from "@/shared/stream/feedviews/FeedView";
import TimelineView from "@/shared/stream/feedviews/TimelineView";
import ChannelFeedShell from "./ChannelFeedShell";

function TimelineBody() {
  return (
    <Show
      when={!loading()}
      fallback={<For each={Array(5).fill(0)}>{() => <FeedPlaceholder />}</For>}
    >
      <TimelineView posts={posts()} handlers={streamHandlers} />
    </Show>
  );
}

export default function ChannelTimelineWidget() {
  return <ChannelFeedShell body={TimelineBody} />;
}
