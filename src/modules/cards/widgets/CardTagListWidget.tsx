import TagListWidget from "@/shared/stream/components/TagListWidget";
import { usePageNick } from "@utsukta/spa-core/store/site-config";
import { activeTag, setCardFilter } from "../store";

export default function CardTagListWidget() {
  return (
    <TagListWidget
      channelNick={usePageNick()()}
      type="cards"
      activeTag={activeTag()}
      onTagClick={(tag) => setCardFilter("tag", tag)}
    />
  );
}
