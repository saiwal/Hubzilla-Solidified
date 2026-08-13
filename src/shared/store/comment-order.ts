import { createSignal } from "solid-js";

export type CommentOrder = "oldest_first" | "newest_first";

const [order, setOrderGlobal] = createSignal<CommentOrder>(
  (localStorage.getItem("hz-comment-order") as CommentOrder | null) ?? "oldest_first"
);

export function useCommentOrder() { return order; }

export function setCommentOrder(value: CommentOrder) {
  setOrderGlobal(value);
  localStorage.setItem("hz-comment-order", value);
}
