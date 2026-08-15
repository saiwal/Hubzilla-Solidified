import CategoryCloudWidget from "@/shared/stream/components/CategoryCloudWidget";
import { usePageNick } from "@utsukta/spa-core/store/site-config";
import { activeCategory, setArticleFilter } from "../store";

export default function ArticleCategoryCloudWidget() {
  return (
    <CategoryCloudWidget
      channelNick={usePageNick()()}
      type="articles"
      activeSlug={activeCategory()}
      onCategoryClick={(slug) => setArticleFilter("cat", slug)}
    />
  );
}
