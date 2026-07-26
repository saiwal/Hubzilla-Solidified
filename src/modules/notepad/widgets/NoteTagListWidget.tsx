import TagListWidget from "@/shared/stream/components/TagListWidget";
import { useSearchParams } from "@solidjs/router";

export default function NoteTagListWidget() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTag = () => String(searchParams.tag ?? "");

  const onTagClick = (tag: string) => {
    setSearchParams({ tag: activeTag() === tag ? undefined : tag, dbegin: undefined, dend: undefined });
  };

  return (
    <TagListWidget
      type="notes"
      activeTag={activeTag()}
      onTagClick={onTagClick}
    />
  );
}
