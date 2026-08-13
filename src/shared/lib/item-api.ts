// src/shared/lib/item-api.ts
import { apiFetch } from './fetch';
import type { CommentOrder } from '../store/comment-order';

const BASE = '/spa/item';

function encodeId(uuid: string): string {
  return encodeURIComponent(uuid);
}

// ── GET ───────────────────────────────────────────────────────────────────────

export const fetchItemDetail = (uuid: string) =>
  apiFetch(`${BASE}/${encodeId(uuid)}`).then(r => r.json());

export interface FetchCommentsOpts {
  /** Numeric = roots_limit (top-level comments per page, each with its ENTIRE reply subtree). 'all' = one-shot full-thread fetch (no pagination). */
  count?: number | 'all';
  rootsOffset?: number;
  order?: CommentOrder;
  /** Fetch ancestors + a sibling window around this comment instead of a page of roots. */
  around?: string;
  before?: number;
  after?: number;
}

export interface CommentsResponse {
  mid: string;
  total: number;
  comments: any[];
  mode?: 'roots' | 'context';
  // roots mode
  roots_offset?: number;
  roots_limit?: number;
  roots_fetched?: number;
  next_roots_offset?: number;
  total_roots?: number;
  order?: CommentOrder;
  has_more_roots?: boolean;
  // context mode
  target_mid?: string;
  target_found?: boolean;
  ancestor_mids?: string[];
  sibling_thr_parent?: string;
  has_more_before?: boolean;
  has_more_after?: boolean;
}

export const fetchComments = (uuid: string, opts: FetchCommentsOpts = {}): Promise<CommentsResponse> => {
  const { count = 'all', rootsOffset, order, around, before, after } = opts;
  const params = new URLSearchParams();
  if (rootsOffset) params.set('roots_offset', String(rootsOffset));
  if (order) params.set('order', order);
  if (around) params.set('around', around);
  if (before !== undefined) params.set('before', String(before));
  if (after !== undefined) params.set('after', String(after));
  const qs = params.toString();
  return apiFetch(`${BASE}/${encodeId(uuid)}/comments/${count}${qs ? `?${qs}` : ''}`).then(r => r.json());
};

export const fetchLikes    = (uuid: string) =>
  apiFetch(`${BASE}/${encodeId(uuid)}/likes`).then(r => r.json());

export const fetchDislikes = (uuid: string) =>
  apiFetch(`${BASE}/${encodeId(uuid)}/dislikes`).then(r => r.json());

export const fetchRepeats  = (uuid: string) =>
  apiFetch(`${BASE}/${encodeId(uuid)}/repeats`).then(r => r.json());

// ── POST ──────────────────────────────────────────────────────────────────────

async function post<T>(url: string, body: Record<string, unknown> = {}): Promise<T> {
  const res = await apiFetch(url, {
    method: 'POST',
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`${res.status}: ${text.slice(0, 200)}`);
  }
  return res.json() as Promise<T>;
}

export interface ReactionResult {
  success: boolean;
  state: 'added' | 'removed';
  like_count: number;
  dislike_count: number;
  announce_count: number;
}

export interface CommentResult {
  success: boolean;
  iid: number;
  mid: string;
  uuid: string;
}

export interface RsvpResult {
  success: boolean;
  state: 'added' | 'removed';
  attend_count: number;
  decline_count: number;
  maybe_count: number;
}

export const apiToggleLike    = (uuid: string) =>
  post<ReactionResult>(`${BASE}/${encodeId(uuid)}/like`);

export const apiToggleDislike = (uuid: string) =>
  post<ReactionResult>(`${BASE}/${encodeId(uuid)}/dislike`);

export const apiToggleRepeat  = (uuid: string) =>
  post<ReactionResult>(`${BASE}/${encodeId(uuid)}/repeat`);

export const apiTogglePin = (uuid: string) =>
  post<{ success: boolean; pinned: boolean }>(`${BASE}/${encodeId(uuid)}/pin`);

export const apiToggleStar = (iid: number): Promise<void> =>
  fetch(`/starred/${iid}`, {
    credentials: 'include',
    headers: { 'X-Requested-With': 'XMLHttpRequest' },
  }).then(() => undefined);

export const apiRsvpAttend  = (uuid: string) =>
  post<RsvpResult>(`${BASE}/${encodeId(uuid)}/accept`);

export const apiRsvpDecline = (uuid: string) =>
  post<RsvpResult>(`${BASE}/${encodeId(uuid)}/reject`);

export const apiRsvpMaybe   = (uuid: string) =>
  post<RsvpResult>(`${BASE}/${encodeId(uuid)}/tentativeaccept`);

export const apiAddToCalendar = (uuid: string) =>
  post<{ success: boolean }>(`${BASE}/${encodeId(uuid)}/addtocal`);

export const apiCreatePost = (body: Record<string, unknown>) =>
  post<{ success: boolean; iid: number; mid: string; uuid: string }>(BASE, body);

export const apiCreateComment = (parentUuid: string, content: string, title = '') =>
  post<CommentResult>(`${BASE}/${encodeId(parentUuid)}/comment`, { body: content, title });

export const apiEditItem = (uuid: string, content: string, title = '') =>
  post<{ success: boolean }>(`${BASE}/${encodeId(uuid)}/edit`, { body: content, title });

export interface ComposeSource {
  success: boolean;
  body: string;
  title: string;
  summary: string;
  mimetype: string;
}

/** Item source for the edit composer — [share …] blocks collapsed to [share=<id>]. */
export const apiFetchComposeSource = (uuid: string) =>
  apiFetch(`${BASE}/${encodeId(uuid)}/compose`).then(r => r.json()) as Promise<ComposeSource>;

export const apiDeleteItem = (uuid: string) =>
  post<{ success: boolean }>(`${BASE}/${encodeId(uuid)}/delete`);

export const apiFetchItemFolders = (uuid: string): Promise<string[]> =>
  apiFetch(`${BASE}/${encodeId(uuid)}/folders`)
    .then(r => r.json())
    .then(d => Array.isArray(d?.data) ? d.data : []);

export const apiSaveToFolder = (uuid: string, name: string, remove = false): Promise<string[]> =>
  post<{ data: { folders: string[] } }>(`${BASE}/${encodeId(uuid)}/saveto`, { name, remove })
    .then(d => d.data.folders);

export const apiVotePoll = (uuid: string, answer: string | string[]) =>
  post<{ success: boolean }>(`${BASE}/${encodeId(uuid)}/vote`, { answer });

export const apiFollowPost = (uuid: string): Promise<void> =>
  post<{ success?: boolean; error?: string }>(`${BASE}/${encodeId(uuid)}/follow`)
    .then(r => { if (!r.success) throw new Error(r.error || 'Follow failed'); });

export const apiUnfollowPost = (uuid: string): Promise<void> =>
  post<{ success?: boolean; error?: string }>(`${BASE}/${encodeId(uuid)}/unfollow`)
    .then(r => { if (!r.success) throw new Error(r.error || 'Unfollow failed'); });
