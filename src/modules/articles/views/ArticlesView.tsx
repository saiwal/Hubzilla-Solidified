// src/modules/articles/views/ArticlesView.tsx
import { createEffect, createSignal, Show, For, Index } from "solid-js";
import { MdOutlineArticle, MdOutlineShare, MdOutlineContent_copy, MdFillSearch, MdFillClose } from "solid-icons/md";
import { useParams, useNavigate, useSearchParams } from "@solidjs/router";
import { useI18n } from "@/i18n";
import { toast } from "@/shared/store/toast";
import { useAuth } from "@/shared/store/auth-store";
import { useViewerRole } from "@/shared/store/site-config";
import { BiRegularEdit, BiRegularCheck } from "solid-icons/bi";
import ArticleComposer from "@/shared/editor/composers/ArticleComposer";
import ComposerModal from "@/shared/editor/components/ComposerModal";
import PostComposer from "@/shared/editor/composers/PostComposer";
import { hydrateLatex } from "@/shared/lib/hydrateLatex";
import {
  posts, loading, hasMore,
  loadArticles, resetPosts, loadMore,
  activeCategory, activeTag, activeDbegin, activeSearch,
  setArticleSearch, clearArticleFilter,
} from "../store";
import type { Post } from "@/shared/types/post.types";
import { articlePath, articleShareUrl, buildArticleShareBody } from "../lib/articleLinks";

// ── helpers ───────────────────────────────────────────────────────────────────

function excerpt(post: Post, maxLen = 200): { text: string; fromSummary: boolean } {
  // Prefer explicit summary — it's already plain text
  if (post.summary) {
    const text = post.summary.length <= maxLen
      ? post.summary
      : post.summary.slice(0, maxLen).replace(/\s+\S*$/, "") + "…";
    return { text, fromSummary: true };
  }
  // Fall back to body: strip HTML (body is already rendered) then truncate
  const plain = (post.body ?? "")
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (!plain) return { text: "", fromSummary: false };
  const text = plain.length <= maxLen
    ? plain
    : plain.slice(0, maxLen).replace(/\s+\S*$/, "") + "…";
  return { text, fromSummary: false };
}

function formatDate(iso: string): string {
  return new Date(iso.replace(" ", "T") + "Z").toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

// ── card ──────────────────────────────────────────────────────────────────────

function ArticleCard(props: { post: Post; nick: string; onOpen: () => void; onShare?: () => void }) {
  const { t } = useI18n();
  const ex = () => excerpt(props.post);
  const [linkCopied, setLinkCopied] = createSignal(false);

  function copyLink(e: MouseEvent) {
    e.stopPropagation();
    navigator.clipboard.writeText(articleShareUrl(props.nick, props.post)).then(() => {
      setLinkCopied(true);
      toast.success(t("articles.link_copied"));
      setTimeout(() => setLinkCopied(false), 1500);
    });
  }

  return (
    <article
      onClick={props.onOpen}
      class="group bg-surface border border-rim rounded-xl p-5 space-y-2
             hover:border-rim-strong hover:bg-elevated cursor-pointer
             transition-colors"
    >
      <h2 class="text-lg font-semibold text-txt leading-snug
                 group-hover:text-accent transition-colors">
        {props.post.title || "(Untitled)"}
      </h2>

      <Show when={ex().text}>
        <p
          class={`text-sm leading-relaxed ${ex().fromSummary ? "text-txt" : "text-muted"}`}
          ref={(el) => createEffect(() => { ex(); hydrateLatex(el); })}
        >
          {ex().text}
        </p>
      </Show>

      <Show when={(props.post.categories?.length ?? 0) > 0 || (props.post.tags?.length ?? 0) > 0}>
        <div class="flex flex-wrap gap-1.5 pt-1">
          <Index each={props.post.categories}>
            {(cat) => (
              <span class="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium
                           bg-accent/15 text-accent border border-accent/30">
                {cat()}
              </span>
            )}
          </Index>
          <Index each={props.post.tags}>
            {(tag) => (
              <span class="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium
                           bg-elevated text-muted border border-rim">
                #{tag()}
              </span>
            )}
          </Index>
        </div>
      </Show>

      <div class="flex items-center gap-3 pt-1 text-xs text-muted">
        <span>{formatDate(props.post.created)}</span>
        <span>·</span>
        <span>{props.post.authorName}</span>
        <Show when={props.post.likeCount > 0}>
          <span>·</span>
          <span>♥ {props.post.likeCount}</span>
        </Show>
        <button
          type="button"
          onClick={copyLink}
          title={t("articles.copy_link")}
          class={`${props.onShare ? "" : "ml-auto "}p-1 rounded-md text-muted hover:text-accent hover:bg-accent/10
                 transition-colors opacity-0 group-hover:opacity-100`}
        >
          <Show when={linkCopied()} fallback={<MdOutlineContent_copy size={15} />}>
            <BiRegularCheck size={15} class="text-accent" />
          </Show>
        </button>
        <Show when={props.onShare}>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); props.onShare!(); }}
            title={t("articles.share")}
            class="ml-auto p-1 rounded-md text-muted hover:text-accent hover:bg-accent/10
                   transition-colors opacity-0 group-hover:opacity-100"
          >
            <MdOutlineShare size={15} />
          </button>
        </Show>
      </div>
    </article>
  );
}

// ── skeleton ──────────────────────────────────────────────────────────────────

function ArticlesListSkeleton() {
  return (
    <div class="space-y-4">
      <For each={Array(6).fill(0)}>
        {() => (
          <div class="bg-surface border border-rim rounded-xl p-5 space-y-3 animate-pulse">
            <div class="h-5 bg-elevated rounded w-2/3" />
            <div class="space-y-1.5">
              <div class="h-3 bg-elevated rounded w-full" />
              <div class="h-3 bg-elevated rounded w-4/5" />
            </div>
            <div class="h-3 bg-elevated rounded w-1/3" />
          </div>
        )}
      </For>
    </div>
  );
}



// ── modal wrapper ─────────────────────────────────────────────────────────────
// Uses a div-based modal (not <dialog>) so AclPicker's portaled dropdown
// stays in the normal stacking context and can appear above the overlay.

function ArticleModal(props: {
  uid: number;
  nick: string;
  onClose: () => void;
}) {
  const { t } = useI18n();

  return (
    <ComposerModal title={t("articles.new_article")} onClose={props.onClose} widthClass="max-w-3xl">
      <ArticleComposer
        profileUid={props.uid}
        nick={props.nick}
        onSaved={() => {
          props.onClose();
          resetPosts();
          loadArticles(props.nick);
        }}
        onCancel={props.onClose}
      />
    </ComposerModal>
  );
}

export default function ArticlesView() {
  const auth = useAuth();
  const role = useViewerRole();
  const { t } = useI18n();
  const params = useParams<{ nick: string }>();
  const navigate = useNavigate();
  const [open, setOpen] = createSignal(false);
  const [sharePost, setSharePost] = createSignal<Post | null>(null);
  const [searchParams] = useSearchParams();
  const [searchOpen, setSearchOpen] = createSignal(!!activeSearch());
  const [searchInput, setSearchInput] = createSignal(activeSearch());
  let initialized = false;

  const submitSearch = (e?: Event) => {
    e?.preventDefault();
    const q = searchInput().trim();
    setArticleSearch(q);
    if (!q) setSearchOpen(false);
  };

  const clearAllFilters = () => {
    setSearchInput("");
    setSearchOpen(false);
    clearArticleFilter();
  };

  createEffect(() => {
    if (auth.loading) return;
    if (initialized) return;
    initialized = true;
    resetPosts();
    loadArticles(params.nick);
    if (searchParams.new === "1" && role() === "owner") setOpen(true);
  });

  const goToArticle = (post: Post) => {
    navigate(articlePath(params.nick, post));
  };

  return (
    <div class="space-y-6 max-w-2xl mx-auto ">
      {/* ── Header row ── */}
      <div class="flex items-center justify-between gap-2">
        <h1 class="text-xl font-bold text-txt">{t("articles.title")}</h1>

        <div class="flex items-center gap-1.5">
          <Show
            when={searchOpen()}
            fallback={
              <button
                type="button"
                title={t("articles.search")}
                onClick={() => { setSearchInput(activeSearch()); setSearchOpen(true); }}
                class={`p-1.5 rounded-lg border transition-colors
                  ${activeSearch()
                    ? "bg-accent text-accent-fg border-accent"
                    : "border-rim bg-surface text-muted hover:bg-elevated hover:text-txt"}`}
              >
                <MdFillSearch size={15} />
              </button>
            }
          >
            <form onSubmit={submitSearch} class="flex items-center gap-1">
              <input
                type="search"
                value={searchInput()}
                onInput={(e) => setSearchInput(e.currentTarget.value)}
                placeholder={t("articles.search_placeholder")}
                autofocus
                onKeyDown={(e) => { if (e.key === "Escape") setSearchOpen(false); }}
                class="w-36 px-2 py-1 text-sm rounded-lg border border-rim bg-surface text-txt outline-none focus:border-accent"
              />
              <button
                type="submit"
                class="p-1.5 rounded-lg border border-rim bg-elevated text-txt hover:bg-overlay transition-colors"
              >
                <MdFillSearch size={15} />
              </button>
              <button
                type="button"
                onClick={() => setSearchOpen(false)}
                class="p-1.5 text-muted hover:text-txt transition-colors"
              >
                <MdFillClose size={15} />
              </button>
            </form>
          </Show>

          <Show when={role() === "owner"}>
            <button
              type="button"
              onClick={() => setOpen(true)}
              class="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium
                     rounded-lg bg-accent text-accent-fg hover:opacity-90
                     transition-opacity"
            >
              <BiRegularEdit class="w-4 h-4" />
              {t("articles.new_article")}
            </button>
          </Show>
        </div>
      </div>

      {/* ── Active filter banner ── */}
      <Show when={activeCategory() || activeTag() || activeDbegin() || activeSearch()}>
        <div class="flex items-center gap-2 px-3 py-2 rounded-lg bg-accent/10 border border-accent/25 text-sm">
          <span class="text-muted">{t("articles.filtered_by")}</span>
          <Show when={activeSearch()}>
            <span class="font-medium text-accent">"{activeSearch()}"</span>
          </Show>
          <Show when={activeCategory()}>
            <span class="font-medium text-accent">{activeCategory()}</span>
          </Show>
          <Show when={activeTag()}>
            <span class="font-medium text-accent">#{activeTag()}</span>
          </Show>
          <Show when={activeDbegin()}>
            <span class="font-medium text-accent">
              {new Date(activeDbegin() + "T00:00:00").toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" })}
            </span>
          </Show>
          <button
            type="button"
            onClick={clearAllFilters}
            class="ml-auto text-xs text-muted hover:text-txt transition-colors"
          >
            {t("articles.clear")}
          </button>
        </div>
      </Show>

      {/* ── List ── */}
      <Show when={!loading()} fallback={<ArticlesListSkeleton />}>
        <Show
          when={posts().length > 0}
          fallback={
            <div class="text-center py-16 text-muted text-sm space-y-2">
              <MdOutlineArticle class="text-2xl text-muted mx-auto" />
              <p>{t("articles.no_articles")}</p>
            </div>
          }
        >
          <div class="space-y-4">
            <For each={posts()}>
              {(post) => (
                <ArticleCard
                  post={post}
                  nick={params.nick}
                  onOpen={() => goToArticle(post)}
                  onShare={auth() ? () => setSharePost(post) : undefined}
                />
              )}
            </For>
          </div>

          <Show when={hasMore()}>
            <div class="flex justify-center pt-2">
              <button
                onClick={loadMore}
                class="px-4 py-2 text-sm font-medium rounded-lg border border-rim
                       bg-surface text-muted hover:bg-elevated transition-colors"
              >
                {t("articles.load_more")}
              </button>
            </div>
          </Show>

          <Show when={!hasMore()}>
            <p class="text-center py-2 text-xs text-muted">{t("articles.all_loaded")}</p>
          </Show>
        </Show>
      </Show>

      {/* ── Share composer ── */}
      <Show when={sharePost() !== null}>
        <PostComposer
          open={true}
          onClose={() => setSharePost(null)}
          profileUid={auth()?.uid ?? 0}
          initialBody={buildArticleShareBody(params.nick, sharePost()!)}
        />
      </Show>

      {/* ── Compose modal ── */}
      <Show when={open()}>
        <ArticleModal
          uid={auth()!.uid}
          nick={params.nick}
          onClose={() => setOpen(false)}
        />
      </Show>
    </div>
  );
}
