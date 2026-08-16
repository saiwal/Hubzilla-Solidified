/**
 * useCategoryTags.ts
 * Shared multi-category tag-chip state, previously duplicated identically
 * between PostComposer and ArticleComposer. Also drives an optional
 * suggestion dropdown of the channel's existing categories.
 */

import { createSignal, createMemo } from "solid-js";

export interface CategoryTags {
  pendingCategory: () => string;
  setPendingCategory: (v: string) => void;
  categoryTags: () => string[];
  addCategoryTag: (raw: string) => void;
  removeCategoryTag: (tag: string) => void;
  onCategoryKeyDown: (e: KeyboardEvent) => void;
  /** Existing categories matching the pending input, for a suggestion dropdown. */
  suggestions: () => string[];
  /** -1 = nothing highlighted (Enter commits the typed text as-is). */
  activeSuggestion: () => number;
}

export function useCategoryTags(
  category: () => string,
  setCategory: (v: string) => void,
  existingCategories: () => string[] = () => [],
): CategoryTags {
  const [pendingCategory, setPendingCategoryRaw] = createSignal("");
  const [activeSuggestion, setActiveSuggestion] = createSignal(-1);

  function setPendingCategory(v: string) {
    setPendingCategoryRaw(v);
    setActiveSuggestion(-1);
  }

  const categoryTags = () =>
    category().split(",").map((s) => s.trim()).filter(Boolean);

  const suggestions = createMemo<string[]>(() => {
    const q = pendingCategory().trim().toLowerCase();
    if (!q) return [];
    const chosen = new Set(categoryTags());
    return existingCategories()
      .filter((c) => c.toLowerCase().startsWith(q) && !chosen.has(c))
      .slice(0, 6);
  });

  function addCategoryTag(raw: string) {
    const incoming = raw.split(",").map((s) => s.trim()).filter(Boolean);
    if (!incoming.length) return;
    const merged = [...new Set([...categoryTags(), ...incoming])];
    setCategory(merged.join(","));
    setPendingCategory("");
  }

  function removeCategoryTag(tag: string) {
    setCategory(categoryTags().filter((t) => t !== tag).join(","));
  }

  function onCategoryKeyDown(e: KeyboardEvent) {
    const items = suggestions();
    if (items.length) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveSuggestion((i) => Math.min(i + 1, items.length - 1));
        return;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveSuggestion((i) => Math.max(i - 1, -1));
        return;
      }
      if (e.key === "Escape") {
        setActiveSuggestion(-1);
        return;
      }
    }
    const val = pendingCategory().trim();
    if ((e.key === "Enter" || e.key === ",") && val) {
      e.preventDefault();
      const idx = activeSuggestion();
      if (idx >= 0 && items[idx]) {
        addCategoryTag(items[idx]);
        return;
      }
      addCategoryTag(pendingCategory());
    } else if (e.key === "Backspace" && !pendingCategory() && categoryTags().length) {
      setCategory(categoryTags().slice(0, -1).join(","));
    }
  }

  return {
    pendingCategory,
    setPendingCategory,
    categoryTags,
    addCategoryTag,
    removeCategoryTag,
    onCategoryKeyDown,
    suggestions,
    activeSuggestion,
  };
}
