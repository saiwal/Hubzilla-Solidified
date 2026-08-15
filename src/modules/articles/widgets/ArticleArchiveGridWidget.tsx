import ArchiveGridWidget from "@/shared/stream/components/ArchiveGridWidget";
import { dayRange } from "@/shared/stream/components/ArchiveWidget";
import { usePageNick } from "@utsukta/spa-core/store/site-config";
import { activeDbegin, activeDend, setArticleDateFilter } from "../store";

export default function ArticleArchiveGridWidget() {
  const onDayClick = (year: number, month: number, day: number) => {
    const [dbegin, dend] = dayRange(year, month, day);
    setArticleDateFilter(dbegin, dend);
  };

  return (
    <ArchiveGridWidget
      channelNick={usePageNick()()}
      type="articles"
      activeDbegin={activeDbegin()}
      activeDend={activeDend()}
      onDayClick={onDayClick}
    />
  );
}
