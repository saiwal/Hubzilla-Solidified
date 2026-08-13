import type { Post } from "../types/post.types";

export interface ThreadNode extends Post {
  children: ThreadNode[];
}

// Authoritative root signal — item_thread_top is set by the backend; mid === top_mid
// is the fallback for response shapes where that flag is missing.
export function isRootPost(node: Pick<Post, "item_thread_top" | "mid" | "top_mid">): boolean {
  return node.item_thread_top === 1 || node.mid === node.top_mid;
}

function makeDeletedPlaceholder(mid: string, attachToMid: string, created: string): ThreadNode {
  return {
    id: mid, uuid: "", mid, parent_mid: attachToMid, thr_parent: attachToMid,
    top_mid: attachToMid, parent: attachToMid, body: "", title: "",
    authorName: "", authorAvatar: "", authorUrl: "", created, item_thread_top: 0,
    flags: ["deleted_placeholder"], permalink: "", children: [],
    likeCount: 0, dislikeCount: 0, repeatCount: 0,
    viewerLiked: false, viewerDisliked: false, viewerRepeated: false,
  };
}

export type ThreadRootOrder = "oldest_first" | "newest_first";

// externalParentMid: a parent mid that's known-valid but deliberately NOT
// included in `posts` — used when building just one comment's OWN subtree
// (see mergeReplies below), where that comment (the branch root) lives one
// level up and is never part of the batch. Without this, buildThreadTree's
// orphan check only knows "thr_parent === parent_mid" (direct reply to the
// THREAD root) as a legitimate reason a parent is absent — it has no way to
// know "direct reply to THIS branch's root comment" is equally legitimate,
// and mislabels every direct child of that comment as an orphan.
export function buildThreadTree(posts: Post[], rootOrder?: ThreadRootOrder, externalParentMid?: string): ThreadNode[] {
  const map = new Map<string, ThreadNode>();
  const roots: ThreadNode[] = [];

  posts.forEach((post) => {
    map.set(post.mid, { ...post, children: [] });
  });

  const isExternalRoot = (node: Pick<Post, "thr_parent">) =>
    externalParentMid !== undefined && node.thr_parent === externalParentMid;

  // First pass: find comments whose direct parent (thr_parent) is missing from
  // the map — these are replies to deleted comments. Create a placeholder node
  // for each missing parent so they render nested rather than as top-level roots.
  const orphanInfo = new Map<string, { attachToMid: string; created: string }>();
  map.forEach((node) => {
    if (isRootPost(node) || isExternalRoot(node)) return;
    const parentKey = node.thr_parent || node.parent_mid;
    // Only synthesize a placeholder when thr_parent points to a specific
    // intermediate comment that is absent from the map. If thr_parent equals
    // parent_mid the comment is a direct reply to the thread root — the root
    // is simply not in this call, not a deleted item.
    if (
      node.thr_parent &&
      node.thr_parent !== node.parent_mid &&
      !map.has(parentKey) &&
      !orphanInfo.has(parentKey)
    ) {
      orphanInfo.set(parentKey, { attachToMid: node.parent_mid || parentKey, created: node.created });
    }
  });
  orphanInfo.forEach(({ attachToMid, created }, missingMid) => {
    map.set(missingMid, makeDeletedPlaceholder(missingMid, attachToMid, created));
  });

  map.forEach((node) => {
    if (isRootPost(node) || isExternalRoot(node)) {
      roots.push(node);
      return;
    }

    // thr_parent is the direct parent mid in Hubzilla's DB
    const parentKey = node.thr_parent || node.parent_mid;
    const parent = map.get(parentKey);

    if (parent) {
      parent.children.push(node);
    } else {
      roots.push(node);
    }
  });

  // Nested replies are always shown oldest-first (a conversation reads top to
  // bottom) — only the TOP-level roots respect rootOrder.
  const sortChildrenAsc = (nodes: ThreadNode[]): ThreadNode[] =>
    nodes
      .sort((a, b) => new Date(a.created).getTime() - new Date(b.created).getTime())
      .map((node) => ({ ...node, children: sortChildrenAsc(node.children) }));

  const sign = rootOrder === "newest_first" ? -1 : 1;
  const sortedRoots = rootOrder
    ? [...roots].sort((a, b) => sign * (new Date(a.created).getTime() - new Date(b.created).getTime()))
    : roots;

  return sortedRoots.map((node) => ({ ...node, children: sortChildrenAsc(node.children) }));
}

export function flattenThread(node: ThreadNode): Post[] {
  return [node, ...node.children.flatMap(flattenThread)];
}

export const REACTION_VERBS = new Set(['Like', 'Dislike', 'Announce', 'Accept', 'Reject', 'TentativeAccept', 'Add', 'Remove', 'Follow', 'Ignore']);

export function isDeletedStub(node: Pick<Post, 'flags'>): boolean {
  return node.flags.includes('deleted') || node.flags.includes('deleted_placeholder');
}

// True only for a SERVER-CONFIRMED deletion (the parent mid was looked up in
// the DB with item_deleted=1). False for makeDeletedPlaceholder's client-side
// guess, which just means "this reply's parent isn't in the current batch" —
// true for a genuinely deleted parent, but ALSO true for one that's simply on
// a page/branch not fetched yet. Callers that render a "deleted" claim should
// check this rather than isDeletedStub, so an unfetched (not deleted) parent
// doesn't get mislabeled.
export function isConfirmedDeleted(node: Pick<Post, 'flags'>): boolean {
  return node.flags.includes('deleted');
}

// Appends a newly-fetched page of root-level comments (threaded mode: each
// bundled with an initial, breadth-first-safe slice of its own descendants —
// see collectSubtree()'s doc comment on the backend; list mode: bare flat
// comments) to an existing children array. Safe as a plain tree-build +
// append: every new top-level node's OWN descendants in this batch are
// self-contained (their parent, if not the bundled root itself, is always
// earlier in the same breadth-first-sliced batch), so buildThreadTree(newPosts)
// never mistakes "fetched on an earlier page" for "deleted" the way merging a
// batch that depends on nodes OUTSIDE itself could (see mergeReplies below,
// used for branch continuations, which do depend on already-fetched nodes).
// rootOrder only affects how the NEW batch's own top-level roots sort among
// themselves — pages are always appended after what's already there, which is
// correct for both directions: oldest_first accumulates older pages below
// newer ones in fetch order, newest_first accumulates progressively older
// pages below the newest ones already shown.
export function appendNewBranches(existingChildren: ThreadNode[], newPosts: Post[], rootOrder?: ThreadRootOrder): ThreadNode[] {
  const existingMids = new Set(existingChildren.flatMap(flattenThread).map((p) => p.mid));
  const freshBranches = buildThreadTree(newPosts, rootOrder).filter((n) => !existingMids.has(n.mid));
  if (!freshBranches.length) return existingChildren;
  return [...existingChildren, ...freshBranches];
}

// Merges a "load more replies" page into ONE comment's own children — unlike
// appendNewBranches, a branch continuation's new slice is NOT self-contained:
// a deeper reply's parent may be an earlier-in-branch node that was already
// fetched on a PREVIOUS branch page, not present in this new batch at all.
// Flattens what's already under this comment, adds the new (deduped) posts,
// and rebuilds the whole subtree via buildThreadTree so an already-fetched
// ancestor is always found — building a fresh mini-tree from just the new
// slice is what produced false "[Comment deleted]" placeholders originally.
// branchRootMid (the expanded comment's own mid) is passed as buildThreadTree's
// externalParentMid: it's the parent of every direct child in this batch, but
// it deliberately never appears IN the batch (it lives one level up, outside
// `existingChildren`/`newPosts`) — without that hint, buildThreadTree has no
// way to distinguish "direct child of the branch root" from a genuine orphan,
// and mislabels every direct child as one.
// Nested replies are always oldest-first (no rootOrder param): only the
// THREAD's top-level roots respect the order setting, a single comment's own
// reply chain always reads chronologically.
export function mergeReplies(existingChildren: ThreadNode[], newPosts: Post[], branchRootMid: string): ThreadNode[] {
  const existingFlat: Post[] = existingChildren
    .flatMap(flattenThread)
    .filter((p) => !p.flags?.includes("deleted_placeholder"));
  const existingMids = new Set(existingFlat.map((p) => p.mid));
  const fresh = newPosts.filter((p) => !existingMids.has(p.mid));
  if (!fresh.length) return existingChildren;
  return buildThreadTree([...existingFlat, ...fresh], undefined, branchRootMid);
}

// Stamps per-branch pagination meta (from a threaded roots-mode response's
// `branches` map) onto the matching top-level nodes — hasMoreComments drives
// that node's own "load more replies" button, commentsOffset seeds where its
// next branch continuation call should start from, and commentsTotal carries
// the branch's true reply-subtree size (server comment_count is unreliable
// for non-root rows — see Post.commentCount's doc comment — so without this,
// a nested comment with pending replies shows "0 replies" and its whole
// reply-count/expand toggle disappears, hiding the "load more" chain under it
// entirely unless "expand all" is used instead).
export function applyBranchMeta(
  nodes: ThreadNode[],
  branches?: Record<string, { has_more: boolean; next_offset: number; total: number }>,
): ThreadNode[] {
  if (!branches) return nodes;
  return nodes.map((n) => {
    const b = branches[n.mid];
    return b ? { ...n, hasMoreComments: b.has_more, commentsOffset: b.next_offset, commentsTotal: b.total } : n;
  });
}

export function countAllComments(nodes: ThreadNode[]): number {
  let count = 0;
  for (const node of nodes) {
    if (isDeletedStub(node)) {
      count += countAllComments(node.children);
    } else if (!REACTION_VERBS.has(node.verb ?? '')) {
      count += 1 + countAllComments(node.children);
    }
  }
  return count;
}
