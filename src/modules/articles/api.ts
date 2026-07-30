import { mapActivityToPost } from "@/shared/lib/activity.mapper";
import type { Post } from "@/shared/types/post.types";
import { apiFetch } from "@/shared/lib/fetch";

export interface ArticleListResponse {
  meta: { offset: number; limit: number; root_count: number };
  articles: Post[];
}

export interface ArticleSingleResponse {
  article: Post;
  comments: Post[];
}

export async function fetchArticles(
  nick: string,
  params: { start?: number; search?: string; tag?: string; cat?: string; dbegin?: string; dend?: string; series?: string } = {},
): Promise<ArticleListResponse> {
  const q = new URLSearchParams();
  if (params.start) q.set("start", String(params.start));
  if (params.search) q.set("search", params.search);
  if (params.tag) q.set("tag", params.tag);
  if (params.cat) q.set("cat", params.cat);
  if (params.dbegin) q.set("dbegin", params.dbegin);
  if (params.dend) q.set("dend", params.dend);
  if (params.series) q.set("series", params.series);
  const qs = q.toString();
  const res = await fetch(`/spa/articles/${nick}${qs ? `?${qs}` : ""}`);
  if (!res.ok) throw new Error("Failed to fetch articles");
  const json = await res.json();
  return {
    articles: (json.data ?? []).map(mapActivityToPost),
    meta: json.meta,
  };
}

export interface SeriesSummary {
  name: string;
  count: number;
  min_order: number | null;
  max_order: number | null;
}

export async function fetchSeriesList(nick: string): Promise<SeriesSummary[]> {
  const res = await fetch(`/spa/articles/${nick}/series`);
  if (!res.ok) throw new Error("Failed to fetch series");
  const json = await res.json();
  return json.data?.series ?? [];
}

export async function fetchSeriesDetail(
  nick: string,
  name: string,
): Promise<{ name: string; articles: Post[] }> {
  const res = await fetch(`/spa/articles/${nick}/series/${encodeURIComponent(name)}`);
  if (!res.ok) throw new Error("Failed to fetch series");
  const json = await res.json();
  return {
    name: json.data?.name ?? name,
    articles: (json.data?.articles ?? []).map(mapActivityToPost),
  };
}

export async function renameSeries(nick: string, from: string, to: string): Promise<void> {
  const res = await apiFetch(`/spa/articles/${nick}/series-rename`, {
    method: "POST",
    body: JSON.stringify({ from, to }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => null);
    throw new Error(err?.error?.message ?? "Rename failed");
  }
}

export async function reorderSeries(
  nick: string,
  series: string,
  order: string[],
): Promise<void> {
  const res = await apiFetch(`/spa/articles/${nick}/series-reorder`, {
    method: "POST",
    body: JSON.stringify({ series, order }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => null);
    throw new Error(err?.error?.message ?? "Reorder failed");
  }
}

export async function fetchArticle(
  nick: string,
  uuid: string,
): Promise<ArticleSingleResponse> {
  const res = await fetch(
    `/spa/articles/${nick}?uuid=${encodeURIComponent(uuid)}`,
  );
  if (!res.ok) throw new Error("Failed to fetch article");
  const json = await res.json();
  return {
    article: mapActivityToPost(json.data.article),
    comments: (json.data.comments ?? []).map(mapActivityToPost),
  };
}

export async function deleteArticle(uuid: string): Promise<void> {
  const res = await apiFetch(`/spa/item/${uuid}/delete`, {
    method: "POST",
    body: JSON.stringify({}),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => null);
    throw new Error(err?.error ?? "Delete failed");
  }
}
