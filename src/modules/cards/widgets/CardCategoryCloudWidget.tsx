import CategoryCloudWidget from "@/shared/stream/components/CategoryCloudWidget";
import { usePageNick } from "@utsukta/spa-core/store/site-config";
import { activeCategory, setCardFilter } from "../store";

export default function CardCategoryCloudWidget() {
  return (
    <CategoryCloudWidget
      channelNick={usePageNick()()}
      type="cards"
      activeSlug={activeCategory()}
      onCategoryClick={(slug) => setCardFilter("cat", slug)}
    />
  );
}
