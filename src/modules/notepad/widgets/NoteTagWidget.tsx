import TagWidget from "@/shared/stream/components/TagWidget";
import { useSearchParams } from "@solidjs/router";

export default function NoteTagWidget() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTag = () => String(searchParams.tag ?? "");

  const onTagClick = (tag: string) => {
    setSearchParams({ tag: activeTag() === tag ? undefined : tag, dbegin: undefined, dend: undefined });
  };

  return (
    <TagWidget
      type="notes"
      activeTag={activeTag()}
      onTagClick={onTagClick}
    />
  );
}
