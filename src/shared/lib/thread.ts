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

export function buildThreadTree(posts: Post[], rootOrder?: ThreadRootOrder): ThreadNode[] {
  const map = new Map<string, ThreadNode>();
  const roots: ThreadNode[] = [];

  posts.forEach((post) => {
    map.set(post.mid, { ...post, children: [] });
  });

  // First pass: find comments whose direct parent (thr_parent) is missing from
  // the map — these are replies to deleted comments. Create a placeholder node
  // for each missing parent so they render nested rather than as top-level roots.
  const orphanInfo = new Map<string, { attachToMid: string; created: string }>();
  map.forEach((node) => {
    if (isRootPost(node)) return;
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
    if (isRootPost(node)) {
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

// Appends a newly-fetched page of root-level comments (each carrying its
// ENTIRE reply subtree — comments are only ever paginated at the root level,
// never within a branch, see the backend's getComments doc comment) to an
// existing children array. Safe as a plain tree-build + append, unlike a
// generic merge: since every branch in newPosts is fetched complete, none of
// its nodes reference a parent living outside this same batch, so
// buildThreadTree(newPosts) can never mistake "fetched on an earlier page"
// for "deleted" the way a partial/sliced batch could.
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
