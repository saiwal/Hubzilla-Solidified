// src/shared/stream/store/createStreamStore.ts
import { createSignal } from "solid-js";
import { buildThreadTree, appendNewBranches } from "@/shared/lib/thread";
import type { ThreadNode, ThreadRootOrder } from "@/shared/lib/thread";
import type { Post } from "@/shared/types/post.types";
import { updateInterval } from "@/shared/store/auth-store";
import { toast } from "@/shared/store/toast";

export interface StreamResult {
  items: Post[];
  rootCount: number;
  limit: number;
  nouveau: boolean;
}

export interface StreamParams {
  start?: number;
  dbegin?: string;
  [key: string]: unknown;
}

// ── private helpers (not exported) ───────────────────────────────────────────

function postToThreadNode(p: Post): ThreadNode {
  return { ...p, children: [] };
}

function registerActivated(set: Set<string>, data: Post[]) {
  data.forEach((p) => {
    if (p.viewerLiked) set.add(`${p.mid}:like`);
    if (p.viewerDisliked) set.add(`${p.mid}:dislike`);
    if (p.viewerRepeated) set.add(`${p.mid}:announce`);
  });
}

export function updateNode(
  nodes: ThreadNode[],
  mid: string,
  updater: (n: ThreadNode) => ThreadNode,
): ThreadNode[] {
  return nodes.map((n) => {
    if (n.mid === mid) return updater(n);
    if (n.children.length)
      return { ...n, children: updateNode(n.children, mid, updater) };
    return n;
  });
}

// ── factory ───────────────────────────────────────────────────────────────────

export function createStreamStore<P extends StreamParams>(
  fetcher: (params: P) => Promise<StreamResult>,
) {
  const [posts, setPosts] = createSignal<ThreadNode[]>([]);
  const [loading, setLoading] = createSignal(false);
  const [loadingMore, setLoadingMore] = createSignal(false);
  const [refreshing, setRefreshing] = createSignal(false);
  const [hasMore, setHasMore] = createSignal(true);
  const [newPosts, setNewPosts] = createSignal<ThreadNode[]>([]);
  const [profileUid, setProfileUid] = createSignal<number>(0);
  const [params, setParams] = createSignal<P>({} as P);

  let currentOffset = 0;
  let pollTimer: ReturnType<typeof setTimeout> | null = null;
  const activated = new Set<string>();

  // ── polling ─────────────────────────────────────────────────────────────────

  function stopPolling() {
    if (pollTimer !== null) {
      clearTimeout(pollTimer);
      pollTimer = null;
    }
  }

  async function checkForNew() {
    const topPost = newPosts()[0] ?? posts()[0];
    if (!topPost) return;
    const topDate = new Date(topPost.created.replace(" ", "T") + "Z");
    topDate.setSeconds(topDate.getSeconds() + 1);
    const dbegin = topDate.toISOString().slice(0, 19).replace("T", " ");
    try {
      const result = await fetcher({ ...params(), start: 0, dbegin } as P);
      if (!result.items.length) return;
      const threads = result.nouveau
        ? result.items.map(postToThreadNode)
        : buildThreadTree(result.items);
      const existingMids = new Set([
        ...posts().map((t) => t.mid),
        ...newPosts().map((t) => t.mid),
      ]);
      const fresh = threads.filter((t) => !existingMids.has(t.mid));
      if (fresh.length) setNewPosts((prev) => [...fresh, ...prev]);
    } catch (err) {
      console.error("Poll failed", err);
    }
  }

  function startPolling() {
    stopPolling();
    const schedule = () => {
      pollTimer = setTimeout(async () => {
        if (document.visibilityState === "visible") await checkForNew();
        schedule();
      }, updateInterval());
    };
    schedule();
  }

  // ── load / loadMore ─────────────────────────────────────────────────────────

  // In flat/unthreaded mode (no thread-top restriction) a raw backend page
  // can consist entirely of non-post activity — likes/reactions on older
  // threads — which fetchers filter out client-side. That doesn't mean the
  // backend is out of data: "more" is driven by the raw rootCount vs limit,
  // not by whether anything survived client-side filtering. Keep pulling
  // pages (bounded) until something displayable turns up or we genuinely
  // run out.
  async function fetchDisplayablePage(startOffset: number): Promise<{
    threads: ThreadNode[];
    offset: number;
    more: boolean;
    result: StreamResult;
  }> {
    let offset = startOffset;
    let more = true;
    let result: StreamResult = { items: [], rootCount: 0, limit: 0, nouveau: false };
    for (let guard = 0; guard < 10 && more; guard++) {
      result = await fetcher({ ...params(), start: offset } as P);
      offset += result.rootCount;
      more = result.rootCount >= result.limit;
      const threads = result.nouveau
        ? result.items.map(postToThreadNode)
        : buildThreadTree(result.items);
      if (threads.length) return { threads, offset, more, result };
    }
    return { threads: [], offset, more, result };
  }

  async function load(newParams?: P) {
    if (newParams !== undefined) setParams(() => newParams);
    setLoading(true);
    setHasMore(true);
    currentOffset = 0;
    stopPolling();
    try {
      const { threads, offset, more, result } = await fetchDisplayablePage(0);
      setPosts(threads);
      setNewPosts([]);
      currentOffset = offset;
      setHasMore(more);
      if (result.items.length && result.items[0].profileUid)
        setProfileUid(result.items[0].profileUid);
      activated.clear();
      registerActivated(activated, result.items);
      startPolling();
    } catch (err) {
      console.error(err);
      toast.error("Failed to load posts. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  async function loadMore() {
    if (loadingMore() || !hasMore()) return;
    setLoadingMore(true);
    try {
      const { threads, offset, more, result } = await fetchDisplayablePage(currentOffset);
      const existingMids = new Set(posts().map((t) => t.mid));
      const fresh = threads.filter((t) => !existingMids.has(t.mid));
      if (fresh.length) setPosts((prev) => [...prev, ...fresh]);
      currentOffset = offset;
      setHasMore(more);
      registerActivated(activated, result.items);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load more posts. Check your connection and try again.");
    } finally {
      setLoadingMore(false);
    }
  }

  // ── reaction helper ─────────────────────────────────────────────────────────

  function optimisticToggle(
    mid: string,
    verbKey: "like" | "dislike" | "announce",
    field: "likeCount" | "dislikeCount" | "repeatCount",
    apiFn: () => Promise<void>,
  ) {
    const viewerFieldMap = {
      like: "viewerLiked",
      dislike: "viewerDisliked",
      announce: "viewerRepeated",
    } as const;
    const viewerField = viewerFieldMap[verbKey];

    const key = `${mid}:${verbKey}`;
    const isUndo = activated.has(key);
    isUndo ? activated.delete(key) : activated.add(key);
    const delta = isUndo ? -1 : 1;
    setPosts((prev) =>
      updateNode(prev, mid, (n) => ({ ...n, [field]: n[field] + delta, [viewerField]: !n[viewerField] })),
    );
    apiFn().catch(() => {
      isUndo ? activated.add(key) : activated.delete(key);
      setPosts((prev) =>
        updateNode(prev, mid, (n) => ({ ...n, [field]: n[field] - delta, [viewerField]: !n[viewerField] })),
      );
    });
  }

  // ── misc ────────────────────────────────────────────────────────────────────

  function setNodeChildren(mid: string, children: ThreadNode[]) {
    setPosts((prev) => updateNode(prev, mid, (n) => ({ ...n, children })));
  }

  // Appends a newly-fetched page of root-level comments (each with its whole
  // reply subtree — comments are only ever paginated at the root level, see
  // appendNewBranches' doc comment) to the thread root's children, and
  // updates hasMoreComments/commentsOffset from that page's response meta.
  // commentsOffset MUST advance here — leaving it unset means every "load
  // more" click keeps requesting roots_offset=0, re-fetching (and silently
  // deduping) the same first page forever.
  function appendNodeChildren(
    mid: string, newPosts: Post[], hasMoreComments: boolean, commentsOffset: number, order?: ThreadRootOrder,
  ) {
    setPosts((prev) =>
      updateNode(prev, mid, (n) => ({
        ...n,
        children: appendNewBranches(n.children, newPosts, order),
        commentsOffset,
        hasMoreComments,
      })),
    );
  }

  function flushNewPosts() {
    setPosts((prev) => [...newPosts(), ...prev]);
    setNewPosts([]);
  }

  async function softRefresh() {
    if (refreshing()) return;
    if (posts().length === 0 && newPosts().length === 0) return load();
    setRefreshing(true);
    try {
      const result = await fetcher({ ...params(), start: 0 } as P);
      const threads = result.nouveau
        ? result.items.map(postToThreadNode)
        : buildThreadTree(result.items);
      const existingMids = new Set([
        ...posts().map((t) => t.mid),
        ...newPosts().map((t) => t.mid),
      ]);
      const fresh = threads.filter((t) => !existingMids.has(t.mid));
      if (fresh.length) {
        setPosts((prev) => [...fresh, ...prev]);
        registerActivated(activated, result.items);
      }
    } catch (err) {
      console.error("Refresh failed", err);
      toast.error("Failed to refresh. Check your connection and try again.");
    } finally {
      setRefreshing(false);
    }
  }

  function reset() {
    setPosts([]);
    setNewPosts([]);
    setHasMore(true);
    currentOffset = 0;
    stopPolling();
  }

  return {
    posts,
    loading,
    loadingMore,
    refreshing,
    hasMore,
    newPosts,
    profileUid,
    load,
    loadMore,
    softRefresh,
    flushNewPosts,
    reset,
    stopPolling,
    optimisticToggle,
    setPosts,
    setNodeChildren,
    appendNodeChildren,
  };
}
