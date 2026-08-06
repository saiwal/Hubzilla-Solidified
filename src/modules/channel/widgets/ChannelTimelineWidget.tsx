// src/modules/channel/widgets/ChannelTimelineWidget.tsx
import { For, Show } from "solid-js";
import { posts, loading, loadingMore, streamHandlers } from "../store";
import TimelineView, {
  TimelineCardPlaceholder,
  TimelinePlaceholder,
} from "@/shared/stream/feedviews/TimelineView";
import ChannelFeedShell from "./ChannelFeedShell";

function TimelineBody() {
  return (
    <Show when={!loading()} fallback={<TimelinePlaceholder />}>
      <TimelineView posts={posts()} handlers={streamHandlers} />
      <Show when={loadingMore()}>
        <div class="max-w-3xl mx-auto space-y-8 mt-8">
          <For each={Array(2).fill(0)}>{() => <TimelineCardPlaceholder />}</For>
        </div>
      </Show>
    </Show>
  );
}

export default function ChannelTimelineWidget() {
  return <ChannelFeedShell body={TimelineBody} />;
}
