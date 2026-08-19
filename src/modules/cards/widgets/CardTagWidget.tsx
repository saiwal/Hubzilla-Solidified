import TagWidget from "@/shared/stream/components/TagWidget";
import { usePageNick } from "@utsukta/spa-core/store/site-config";
import { activeTag, setCardFilter } from "../store";

export default function CardTagWidget() {
  return (
    <TagWidget
      channelNick={usePageNick()()}
      type="cards"
      activeTag={activeTag()}
      onTagClick={(tag) => setCardFilter("tag", tag)}
    />
  );
}
