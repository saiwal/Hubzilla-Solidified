// src/shared/lib/useDocs.ts
import { useI18n } from "@/i18n";
import { type Accessor } from "solid-js";
import { createQueryResource } from "@/shared/lib/createQueryResource";
import { apiFetch } from "@/shared/lib/fetch";
import type { DocType } from "@/shared/store/help-mode";

async function fetchRawDoc(type: DocType, lang: string, path: string): Promise<string | null> {
  const res = await apiFetch(
    `/spa/help/topic?section=${type}&lang=${encodeURIComponent(lang)}&topic=${encodeURIComponent(path)}&format=raw`
  );
  if (!res.ok) return null;
  const json = await res.json();
  return (json.data ?? json)?.content ?? null;
}

export function useDocs(path: Accessor<string>, docType: Accessor<DocType>) {
  const { locale } = useI18n();

  return createQueryResource(
    "docs",
    () => ({
      lang: locale(),
      type: docType(),
      path: path(),
    }),
    async ({ lang, type, path }) => {
      const content = await fetchRawDoc(type, lang, path);
      if (content !== null) return content;
      return fetchRawDoc(type, "en", path);
    }
  );
}
