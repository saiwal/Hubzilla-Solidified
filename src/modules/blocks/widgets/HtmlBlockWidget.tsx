// Free-form HTML block (config: { title?, html }) — or a saved Hubzilla block
// preset (config: { title?, blockName }), see HtmlBlockConfig.tsx. Custom HTML
// is sanitised with DOMPurify directly; a block preset is fetched by name and
// rendered via the shared renderBody() (bbcode/html/markdown), same as
// PageView.tsx — and is ACL-gated server-side, so a private block won't leak
// to a visitor even though this widget instance might sit in a shared layout.

import { createMemo, Show } from "solid-js";
import DOMPurify from "dompurify";
import type { WidgetProps } from "@/shared/types/module.types";
import { editingWidgets } from "@/shared/store/widget-layout";
import { useI18n } from "@/i18n";
import { usePageNick } from "@/shared/store/site-config";
import { createQueryResource } from "@/shared/lib/createQueryResource";
import { fetchBlockByName } from "@/modules/webpages/api";
import { renderBody } from "@/shared/lib/renderBody";

export default function HtmlBlockWidget(props: WidgetProps) {
  const { t } = useI18n();
  const nick = usePageNick();
  const title = () => String(props.config?.title ?? "");
  const html = () => String(props.config?.html ?? "");
  const blockName = () => String(props.config?.blockName ?? "");

  const [block] = createQueryResource(
    "html-block-widget",
    () => (blockName() && nick() ? { nick: nick(), name: blockName() } : null),
    ({ nick, name }) => fetchBlockByName(nick, name),
  );

  const customClean = createMemo(() =>
    DOMPurify.sanitize(html(), { USE_PROFILES: { html: true } }),
  );
  const blockClean = createMemo(() => {
    const b = block();
    return b ? renderBody(b.body, b.mimetype) : "";
  });

  const content = () => (blockName() ? blockClean() : customClean());
  const hasContent = () => (blockName() ? !!block() : !!html());

  return (
    <Show
      when={hasContent()}
      fallback={
        <Show when={editingWidgets()}>
          <div class="bg-surface border border-rim rounded-xl px-4 py-3">
            <p class="text-xs text-muted">
              {blockName() && block.error ? t("widgets.block_load_failed") : t("widgets.not_configured")}
            </p>
          </div>
        </Show>
      }
    >
      <div class="bg-surface border border-rim rounded-xl overflow-hidden">
        <Show when={title()}>
          <div class="px-4 py-3">
            <h3 class="text-sm font-semibold text-txt">{title()}</h3>
          </div>
        </Show>
        <div
          class="px-4 py-3 prose prose-sm dark:prose-invert max-w-none text-txt"
          innerHTML={content()}
        />
      </div>
    </Show>
  );
}
