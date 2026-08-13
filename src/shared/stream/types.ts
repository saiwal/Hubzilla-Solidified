// src/shared/stream/types.ts
import type { CommentOrder } from "@/shared/store/comment-order";

export interface StreamHandlers {
  onLike: (mid: string) => void;
  onDislike: (mid: string) => void;
  onRepeat: (mid: string) => void;
  onComment: (
    parentMid: string,
    body: string,
    authorName: string,
    authorAvatar: string,
  ) => void;
  onLoadComments: (mid: string, uuid: string) => Promise<void>;
  // Pages in the next batch of top-level comments for an already-loaded post
  // (each with its whole reply subtree — comments are only ever paginated at
  // the root level, never within a branch). Optional: consumers that fetch
  // the whole thread upfront (some detail views) don't need it.
  onLoadMoreComments?: (mid: string, uuid: string, offset: number, order: CommentOrder) => Promise<void>;
  onStar?: (mid: string) => void;
  onPin?: (mid: string) => void;
  onDelete?: (mid: string) => Promise<void>;
  onEdit?: (mid: string, body: string, title?: string) => Promise<void>;
  onRefresh?: (mid: string, uuid: string) => Promise<void>;
  // Approve/reject a comment or wall post stuck in moderation
  // (post.flags includes "pending_moderation") — see src/modules/moderate/api.ts.
  onApprove?: (iid: number) => Promise<void>;
  onReject?: (iid: number) => Promise<void>;
}

export type ViewMode = "feed" | "masonry" | "list";
