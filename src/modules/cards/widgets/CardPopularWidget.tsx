import PopularPostsWidget from "@/shared/stream/components/PopularPostsWidget";
import { usePageNick } from "@utsukta/spa-core/store/site-config";

export default function CardPopularWidget() {
  return <PopularPostsWidget channelNick={usePageNick()()} type="cards" />;
}
