import { Show } from "solid-js";
import { useNavigate } from "@solidjs/router";
import DraftsWidgetBase from "@/shared/editor/components/DraftsWidgetBase";
import { useViewerRole, usePageNick } from "@/shared/store/site-config";
import { useI18n } from "@/i18n";

// ── Scope helpers ─────────────────────────────────────────────────────────────
// Wiki drafts carry scope "wiki:<wikiName>:<pageName>" — both segments are
// the actual route params (already URL-path-safe), so no extra encode/decode
// is needed to round-trip them into a route.

function scopeParts(scope: string): { wikiName: string; pageName: string } {
  const [, wikiName = "", ...rest] = scope.split(":");
  return { wikiName, pageName: rest.join(":") };
}

function isLoadable(scope: string): boolean {
  const { wikiName, pageName } = scopeParts(scope);
  return !!wikiName && !!pageName;
}

// ── Widget ────────────────────────────────────────────────────────────────────

export default function WikiDraftsWidget() {
  const role = useViewerRole();
  const pageNick = usePageNick();
  const navigate = useNavigate();
  const { t } = useI18n();

  return (
    <Show when={role() === "owner"}>
      <DraftsWidgetBase
        scopeType="wiki"
        title={t("wiki.drafts")}
        emptyText={t("wiki.no_drafts")}
        refreshTitle={t("wiki.refresh_drafts")}
        deleteTitle={t("wiki.delete_draft")}
        untitledText={t("wiki.untitled")}
        emptyDraftText={t("wiki.empty_draft")}
        badgeClassName="bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/25"
        badgeLabel={(scope) => {
          const { wikiName } = scopeParts(scope);
          return wikiName ? decodeURIComponent(wikiName) : t("wiki.draft_label");
        }}
        isLoadable={isLoadable}
        // WikiPageView owns pending-draft restoration itself (wiki has no
        // createComposerStore to do it generically — see WikiPageView.tsx).
        onLoad={(entry) => {
          const { wikiName, pageName } = scopeParts(entry.scope);
          navigate(`/wiki/${pageNick()}/${wikiName}/${pageName}`);
        }}
      />
    </Show>
  );
}
