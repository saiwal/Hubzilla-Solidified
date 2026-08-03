// src/shared/stream/feedviews/ScrapbookView.tsx
import { For, Show, createSignal } from "solid-js";
import type { ThreadNode } from "@/shared/lib/thread";
import { countAllComments } from "@/shared/lib/thread";
import type { StreamHandlers } from "../types";
import PostDetailModal from "@/shared/views/PostDetailModal";
import { excerptOf, firstImageSrc } from "./postExcerpt";
import { useAuth } from "@/shared/store/auth-store";
import { useI18n } from "@/i18n";
import formatPostDate from "@/shared/lib/date";
import { MdFillPush_pin } from "solid-icons/md";

const ROTATIONS = ["-rotate-3", "rotate-2", "-rotate-1", "rotate-3", "-rotate-2", "rotate-1"];
const NOTE_COLORS = [
  "bg-amber-100 dark:bg-amber-200",
  "bg-sky-100 dark:bg-sky-200",
  "bg-rose-100 dark:bg-rose-200",
  "bg-lime-100 dark:bg-lime-200",
];

function replyCountOf(post: ThreadNode): number {
  return post.children.length > 0 ? countAllComments(post.children) : (post.commentCount ?? 0);
}

// Small ink-stamp footer shared by both card styles — always dark-on-light,
// since it sits on physical "paper" that doesn't follow the app theme.
function Stamp(props: { post: ThreadNode; handlers: StreamHandlers }) {
  const p = props.post;
  const auth = useAuth();
  const canInteract = () => auth()?.isLoggedIn === true;
  const { locale } = useI18n();
  return (
    <div class="flex items-center gap-2 mt-2 text-[11px] text-neutral-500" onClick={(e) => e.stopPropagation()}>
      <span class="font-semibold text-neutral-700 truncate">{p.authorName}</span>
      <span class="shrink-0">· {formatPostDate(p.created, locale())}</span>
      <span class="ml-auto flex items-center gap-2 shrink-0">
        <Show when={canInteract()}>
          <button
            onClick={() => props.handlers.onLike(p.mid)}
            class="flex items-center gap-0.5 transition-colors"
            classList={{ "text-rose-500": p.viewerLiked, "hover:text-rose-500": !p.viewerLiked }}
          >
            <svg class="w-3 h-3" viewBox="0 0 24 24" fill={p.viewerLiked ? "currentColor" : "none"} stroke="currentColor" stroke-width="2">
              <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            <Show when={p.likeCount > 0}>{p.likeCount}</Show>
          </button>
        </Show>
        <Show when={replyCountOf(p) > 0}>
          <span>💬 {replyCountOf(p)}</span>
        </Show>
      </span>
    </div>
  );
}

function PhotoCard(props: { post: ThreadNode; src: string; rotate: string; handlers: StreamHandlers; onOpen: () => void }) {
  return (
    <div class={`${props.rotate} hover:rotate-0 hover:scale-[1.02] transition-transform duration-200
                  break-inside-avoid mb-5 bg-white p-3 pb-3 shadow-[0_4px_10px_rgba(0,0,0,0.25)] cursor-pointer relative`}
      onClick={props.onOpen}
    >
      {/* pushpin */}
      <span class="absolute -top-2.5 left-1/2 -translate-x-1/2 w-3.5 h-3.5 rounded-full bg-red-500 shadow-[0_2px_3px_rgba(0,0,0,0.4)] ring-2 ring-red-700/40 z-10" />
      <Show when={props.post.pinned}>
        <span class="absolute top-2 right-2 z-10 text-white bg-black/60 rounded-full p-1" title="Pinned">
          <MdFillPush_pin size={11} />
        </span>
      </Show>
      <img src={props.src} alt="" class="w-full aspect-square object-cover" />
      <Show when={props.post.title || excerptOf(props.post, 80)}>
        <p class="mt-2 text-sm italic font-serif text-neutral-800 line-clamp-2">
          {props.post.title || excerptOf(props.post, 80)}
        </p>
      </Show>
      <Stamp post={props.post} handlers={props.handlers} />
    </div>
  );
}

function StickyNote(props: { post: ThreadNode; rotate: string; color: string; handlers: StreamHandlers; onOpen: () => void }) {
  return (
    <div
      class={`${props.rotate} ${props.color} hover:rotate-0 hover:scale-[1.02] transition-transform duration-200
              break-inside-avoid mb-5 p-4 shadow-[0_4px_10px_rgba(0,0,0,0.2)] cursor-pointer relative`}
      onClick={props.onOpen}
    >
      {/* tape */}
      <span class="absolute -top-2 left-1/2 -translate-x-1/2 w-14 h-4 bg-neutral-100/60 dark:bg-neutral-100/50 rotate-2 shadow-sm" />
      <Show when={props.post.pinned}>
        <span class="absolute top-2 right-2 text-neutral-700" title="Pinned">
          <MdFillPush_pin size={13} />
        </span>
      </Show>
      <p class="font-serif italic text-[15px] leading-snug text-neutral-800 line-clamp-6">
        {props.post.title || excerptOf(props.post, 220)}
      </p>
      <Stamp post={props.post} handlers={props.handlers} />
    </div>
  );
}

export default function ScrapbookView(props: { posts: ThreadNode[]; handlers: StreamHandlers }) {
  const { t } = useI18n();
  const [modalUuid, setModalUuid] = createSignal<string | null>(null);

  return (
    <div class="max-w-6xl mx-auto">
      <div class="columns-2 sm:columns-3 lg:columns-4 gap-5">
        <For
          each={props.posts}
          fallback={<p class="text-center py-16 text-muted text-sm break-inside-avoid">{t("network.all_caught_up")}</p>}
        >
          {(post, i) => {
            const src = firstImageSrc(post.body);
            const rotate = ROTATIONS[i() % ROTATIONS.length];
            const onOpen = () => setModalUuid(post.uuid);
            return src ? (
              <PhotoCard post={post} src={src} rotate={rotate} handlers={props.handlers} onOpen={onOpen} />
            ) : (
              <StickyNote post={post} rotate={rotate} color={NOTE_COLORS[i() % NOTE_COLORS.length]} handlers={props.handlers} onOpen={onOpen} />
            );
          }}
        </For>
      </div>

      <Show when={modalUuid()}>
        {(uuid) => (
          <PostDetailModal
            uuid={uuid()}
            onClose={() => setModalUuid(null)}
            handlers={props.handlers}
          />
        )}
      </Show>
    </div>
  );
}
