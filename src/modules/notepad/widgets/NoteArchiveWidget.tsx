import ArchiveWidget, { monthRange } from "@/shared/stream/components/ArchiveWidget";
import { useSearchParams } from "@solidjs/router";

export default function NoteArchiveWidget() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeDbegin = () => String(searchParams.dbegin ?? "");
  const activeDend   = () => String(searchParams.dend   ?? "");

  const onMonthClick = (year: number, month: number) => {
    const [dbegin, dend] = monthRange(year, month);
    const isActive = activeDbegin() === dbegin && activeDend() === dend;
    if (isActive) {
      setSearchParams({ dbegin: undefined, dend: undefined });
    } else {
      setSearchParams({ dbegin, dend, tag: undefined });
    }
  };

  return (
    <ArchiveWidget
      type="notes"
      activeDbegin={activeDbegin()}
      activeDend={activeDend()}
      onMonthClick={onMonthClick}
    />
  );
}
