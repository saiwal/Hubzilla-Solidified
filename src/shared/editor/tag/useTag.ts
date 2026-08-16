/**
 * useTag.ts
 * Hashtag (#) autocomplete hook — mirrors useEmoji but suggests the
 * channel's existing tags (fetched once, client-filtered) instead of a
 * static emoji map.
 */

import { createSignal, createMemo } from "solid-js";
import { createQueryResource } from "@utsukta/spa-core/lib/createQueryResource";
import { fetchTags, type TagItem } from "@/shared/stream/components/TagWidget";
import { getCaretRect } from "../mention/useMention";

export type { TagItem };

// ── Query extraction ──────────────────────────────────────────────────────────

const VALID_TAG = /^[a-zA-Z0-9_]+$/;

function extractTagQuery(textBefore: string): string | null {
  const idx = textBefore.lastIndexOf("#");
  if (idx === -1) return null;
  const fragment = textBefore.slice(idx + 1);
  if (!fragment.length) return null;
  if (!VALID_TAG.test(fragment)) return null;
  return fragment;
}

export function getWysiwygTagQuery(): string | null {
  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0) return null;
  const range = sel.getRangeAt(0);
  const node = range.startContainer;
  if (node.nodeType !== Node.TEXT_NODE) return null;
  const before = (node.textContent ?? "").slice(0, range.startOffset);
  return extractTagQuery(before);
}

export function getTextareaTagQuery(ta: HTMLTextAreaElement): string | null {
  return extractTagQuery(ta.value.slice(0, ta.selectionStart));
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export interface TagState {
  query:     () => string | null;
  rect:      () => DOMRect | null;
  activeIdx: () => number;
  filtered:  () => TagItem[];
  open:      () => boolean;

  onWysiwygInput:  () => void;
  onTextareaInput: (ta: HTMLTextAreaElement) => void;
  onKeyDown:       (e: KeyboardEvent) => boolean;

  insertWysiwyg:  (entry: TagItem, syncBody: () => void) => void;
  insertTextarea: (entry: TagItem, ta: HTMLTextAreaElement, setBody: (v: string) => void) => void;

  openWithQuery: (q: string, rect: DOMRect) => void;
  close:         () => void;
}

export function useTag(
  channelNick: () => string,
  type: () => "posts" | "articles" | "notes",
): TagState {
  const [query,     setQuery]     = createSignal<string | null>(null);
  const [rect,      setRect]      = createSignal<DOMRect | null>(null);
  const [activeIdx, setActiveIdx] = createSignal(0);

  const [tagList] = createQueryResource(
    "composer-tags",
    () => ({ channelNick: channelNick(), type: type() }),
    fetchTags,
  );

  const filtered = createMemo<TagItem[]>(() => {
    const q = query();
    if (q === null) return [];
    const lq = q.toLowerCase();
    return (tagList() ?? [])
      .filter((t) => t.name.toLowerCase().startsWith(lq))
      .slice(0, 8);
  });

  const open = () => query() !== null && filtered().length > 0;

  function close() {
    setQuery(null);
    setRect(null);
    setActiveIdx(0);
  }

  function onWysiwygInput() {
    const q = getWysiwygTagQuery();
    if (q !== null) {
      setQuery(q);
      setActiveIdx(0);
      const r = getCaretRect();
      if (r) setRect(r);
    } else {
      close();
    }
  }

  function onTextareaInput(ta: HTMLTextAreaElement) {
    const q = getTextareaTagQuery(ta);
    if (q !== null) {
      setQuery(q);
      setActiveIdx(0);
      setRect(ta.getBoundingClientRect());
    } else {
      close();
    }
  }

  function onKeyDown(e: KeyboardEvent): boolean {
    if (!open()) return false;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIdx(i => Math.min(i + 1, filtered().length - 1));
      return true;
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIdx(i => Math.max(i - 1, 0));
      return true;
    }
    if (e.key === "Enter" || e.key === "Tab") {
      e.preventDefault();
      return true;
    }
    if (e.key === "Escape") {
      e.stopPropagation();
      close();
      return true;
    }
    return false;
  }

  function insertWysiwyg(entry: TagItem, syncBody: () => void) {
    const sel = window.getSelection();
    const q = query() ?? "";
    if (sel && sel.rangeCount > 0) {
      const range = sel.getRangeAt(0);
      range.setStart(range.startContainer, Math.max(0, range.startOffset - q.length - 1));
      range.deleteContents();
      const textNode = document.createTextNode(`#${entry.name} `);
      range.insertNode(textNode);
      range.setStartAfter(textNode);
      range.collapse(true);
      sel.removeAllRanges();
      sel.addRange(range);
    }
    setTimeout(syncBody, 0);
    close();
  }

  function insertTextarea(entry: TagItem, ta: HTMLTextAreaElement, setBody: (v: string) => void) {
    const tag = `#${entry.name}`;
    const cursor = ta.selectionStart;
    const before = ta.value.slice(0, cursor);
    const hashIdx = before.lastIndexOf("#");
    const newVal = ta.value.slice(0, hashIdx) + tag + " " + ta.value.slice(cursor);
    setBody(newVal);
    requestAnimationFrame(() => {
      const pos = hashIdx + tag.length + 1;
      ta.focus();
      ta.setSelectionRange(pos, pos);
    });
    close();
  }

  function openWithQuery(q: string, r: DOMRect) {
    setQuery(q);
    setRect(r);
  }

  return {
    query, rect, activeIdx, filtered, open,
    onWysiwygInput, onTextareaInput, onKeyDown,
    insertWysiwyg, insertTextarea,
    openWithQuery, close,
  };
}
