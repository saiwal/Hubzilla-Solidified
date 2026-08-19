// src/modules/cards/store.ts
import { createSignal } from "solid-js";
import { createStreamStore } from "@/shared/stream/store/createStreamStore";
import { fetchCards } from "./api";
import type { StreamResult, StreamParams } from "@/shared/stream/store/createStreamStore";

export interface CardParams extends StreamParams {
  search?: string;
  tag?: string;
  cat?: string;
  dbegin?: string;
  dend?: string;
  deck?: string;
}

// ── nick signal ───────────────────────────────────────────────────────────────
const [nick, setNick] = createSignal("");
export { nick };

// ── fetcher adapter ───────────────────────────────────────────────────────────
async function cardsFetcher(params: CardParams): Promise<StreamResult> {
  const res = await fetchCards(nick(), params);
  return {
    items: res.cards,
    rootCount: res.meta.root_count,
    limit: res.meta.limit,
    nouveau: false,
  };
}

// ── active filters ────────────────────────────────────────────────────────────
const [activeCategory, setActiveCategory] = createSignal<string>("");
const [activeTag, setActiveTag] = createSignal<string>("");
const [activeDbegin, setActiveDbegin] = createSignal<string>("");
const [activeDend, setActiveDend] = createSignal<string>("");
const [activeSearch, setActiveSearch] = createSignal<string>("");
export { activeCategory, activeTag, activeDbegin, activeDend, activeSearch };

export function setCardFilter(type: "cat" | "tag", value: string) {
  if (type === "cat") {
    const next = activeCategory() === value ? "" : value;
    setActiveCategory(next);
    setActiveTag("");
  } else {
    const next = activeTag() === value ? "" : value;
    setActiveTag(next);
    setActiveCategory("");
  }
  setActiveDbegin("");
  setActiveDend("");
  setActiveSearch("");
  store.reset();
  store.load({ cat: activeCategory(), tag: activeTag() });
}

export function setCardDateFilter(dbegin: string, dend: string) {
  const isActive = activeDbegin() === dbegin && activeDend() === dend;
  setActiveDbegin(isActive ? "" : dbegin);
  setActiveDend(isActive ? "" : dend);
  setActiveCategory("");
  setActiveTag("");
  setActiveSearch("");
  store.reset();
  store.load({ dbegin: activeDbegin(), dend: activeDend() });
}

export function setCardSearch(value: string) {
  const next = value.trim();
  setActiveSearch(next);
  setActiveCategory("");
  setActiveTag("");
  setActiveDbegin("");
  setActiveDend("");
  store.reset();
  store.load({ search: next || undefined });
}

export function clearCardFilter() {
  setActiveCategory("");
  setActiveTag("");
  setActiveDbegin("");
  setActiveDend("");
  setActiveSearch("");
  store.reset();
  store.load({});
}

// ── store instance ────────────────────────────────────────────────────────────
const store = createStreamStore<CardParams>(cardsFetcher);
export const {
  posts, loading, loadingMore, hasMore, newPosts, profileUid,
  loadMore, flushNewPosts, stopPolling,
} = store;

export function resetPosts() { store.reset(); }
export async function loadCards(nickname: string, params?: CardParams) {
  setNick(nickname);
  return store.load(params);
}
