// src/shared/stream/store/post-modal-store.ts
import { createSignal } from "solid-js";
import type { ThreadNode } from "@utsukta/spa-core/lib/thread";

const [openPost, setOpenPost] = createSignal<ThreadNode | null>(null);

export const openPostModal  = (post: ThreadNode) => setOpenPost(post);
export const closePostModal = () => setOpenPost(null);
export { openPost };
