import { Show } from "solid-js";
import { useNavigate } from "@solidjs/router";
import DraftsWidgetBase from "@/shared/editor/components/DraftsWidgetBase";
import { useViewerRole, usePageNick } from "@utsukta/spa-core/store/site-config";
import { useI18n } from "@utsukta/spa-core/i18n";

// ── Scope helpers ─────────────────────────────────────────────────────────────
// Webpage drafts carry scope "webpage:new" or "webpage:edit:<uuid>"

function scopeParts(scope: string): { action: string; uuid: string } {
  const [, action = "", ...rest] = scope.split(":");
  return { action, uuid: rest.join(":") };
}

// "webpage:edit:<uuid>" can't be resumed here — the editor needs the page's
// numeric iid (fetched via a separate lookup) to restore ACL/layout before it
// can mount, and the scope only carries the uuid. Only fresh pages qualify.
function isLoadable(scope: string): boolean {
  return scopeParts(scope).action === "new";
}

// ── Widget ────────────────────────────────────────────────────────────────────

export default function WebpageDraftsWidget() {
  const role = useViewerRole();
  const pageNick = usePageNick();
  const navigate = useNavigate();
  const { t } = useI18n();

  return (
    <Show when={role() === "owner"}>
      <DraftsWidgetBase
        scopeType="webpage"
        title={t("webpages.drafts")}
        emptyText={t("webpages.no_drafts")}
        refreshTitle={t("webpages.refresh_drafts")}
        deleteTitle={t("webpages.delete_draft")}
        untitledText={t("webpages.untitled")}
        emptyDraftText={t("webpages.empty_draft")}
        badgeClassName="bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/25"
        badgeLabel={(scope) => scopeParts(scope).action === "edit" ? t("webpages.draft_edit") : t("webpages.draft_new")}
        isLoadable={isLoadable}
        // WebpageComposer lives on its own routed page, not a modal — the
        // pending-draft written by DraftsWidgetBase is picked up automatically
        // by createComposerStore once that page mounts.
        onLoad={() => navigate(`/webpages/${pageNick()}/new`)}
      />
    </Show>
  );
}
