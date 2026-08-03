// src/modules/channel/widgets/ChannelNewspaperWidget.tsx
import { For, Show } from "solid-js";
import { nick, posts, loading, streamHandlers } from "../store";
import { fetchChannelPosts } from "../api";
import { fetchCategories } from "@/shared/stream/components/CategoryWidget";
import { createQueryResource } from "@/shared/lib/createQueryResource";
import { FeedPlaceholder } from "@/shared/stream/feedviews/FeedView";
import NewspaperView, { type CategoryGroup } from "@/shared/stream/feedviews/NewspaperView";
import ChannelFeedShell from "./ChannelFeedShell";

const SECTION_COUNT = 6;
const POSTS_PER_SECTION = 4;

// Categories aren't attached to individual posts in the stream response
// (only exposed in aggregate via /spa/stream-widgets/categories), so the
// "few latest articles per category" panels need their own fetch per
// category rather than grouping the already-loaded page of posts.
async function fetchCategoryGroups(channelNick: string): Promise<CategoryGroup[]> {
  const categories = await fetchCategories({ channelNick, type: "posts" });
  const groups = await Promise.all(
    categories.slice(0, SECTION_COUNT).map(async (cat) => {
      const result = await fetchChannelPosts(channelNick, { cat: cat.slug });
      return {
        name: cat.name,
        posts: result.items.filter((p) => p.item_thread_top === 1).slice(0, POSTS_PER_SECTION),
      };
    }),
  );
  return groups.filter((g) => g.posts.length > 0);
}

function NewspaperBody() {
  const [categoryGroups] = createQueryResource(
    "channel-newspaper-sections",
    () => nick() || null,
    fetchCategoryGroups,
  );

  return (
    <Show
      when={!loading()}
      fallback={<For each={Array(5).fill(0)}>{() => <FeedPlaceholder />}</For>}
    >
      <NewspaperView posts={posts()} handlers={streamHandlers} categoryGroups={categoryGroups()} />
    </Show>
  );
}

export default function ChannelNewspaperWidget() {
  return <ChannelFeedShell body={NewspaperBody} />;
}
