import TagListWidget from "@/shared/stream/components/TagListWidget";
import { usePageNick } from "@utsukta/spa-core/store/site-config";
import { activeTag, setArticleFilter } from "../store";

export default function ArticleTagListWidget() {
  return (
    <TagListWidget
      channelNick={usePageNick()()}
      type="articles"
      activeTag={activeTag()}
      onTagClick={(tag) => setArticleFilter("tag", tag)}
    />
  );
}
