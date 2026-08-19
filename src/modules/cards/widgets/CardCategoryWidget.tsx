import CategoryWidget from "@/shared/stream/components/CategoryWidget";
import { usePageNick } from "@utsukta/spa-core/store/site-config";
import { activeCategory, setCardFilter } from "../store";

export default function CardCategoryWidget() {
  return (
    <CategoryWidget
      channelNick={usePageNick()()}
      type="cards"
      activeSlug={activeCategory()}
      onCategoryClick={(slug) => setCardFilter("cat", slug)}
    />
  );
}
