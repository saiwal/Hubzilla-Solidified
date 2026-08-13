import { createSignal, Show } from "solid-js";
import { useI18n } from "@/i18n";
import RichEditor from "../core/RichEditor";
import { CAPABILITIES } from "../types/editor.types";
import type { MimeType, EditorTab } from "../types/editor.types";
import { underlineFieldClass } from "../lib/fieldStyles";
import SourceToggleButton from "../components/SourceToggleButton";

interface Props {
  initialBody: string;
  initialCommitMsg?: string;
  mimeType: string;
  saving: boolean;
  onSave: (body: string, commitMsg: string) => void;
  onCancel: () => void;
  onSaveDraft?: (body: string, commitMsg: string) => void;
}

export default function WikiComposer(props: Props) {
  const { t } = useI18n();
  const caps = CAPABILITIES.wiki;

  const [body, setBody] = createSignal(props.initialBody);
  const [tab, setTab] = createSignal<EditorTab>("source");
  const [commitMsg, setCommitMsg] = createSignal(props.initialCommitMsg ?? "");

  const mime = () => (props.mimeType as MimeType) ?? "text/bbcode";

  return (
    <div class="space-y-3">
      <RichEditor
        body={body()}
        onInput={setBody}
        capabilities={caps}
        tab={tab()}
        onTabChange={setTab}
        mimetype={mime()}
        placeholder={t("editor.start_writing")}
        minHeight="320px"
      />

      <div class="flex justify-end">
        <SourceToggleButton tab={tab()} onToggle={() => setTab(tab() === "wysiwyg" ? "source" : "wysiwyg")} />
      </div>

      <input
        type="text"
        class={`w-full px-0 py-1.5 text-sm text-txt ${underlineFieldClass}`}
        placeholder={t("wiki.changes_placeholder")}
        value={commitMsg()}
        onInput={(e) => setCommitMsg(e.currentTarget.value)}
      />

      <div class="flex items-center justify-between gap-2">
        <div class="flex items-center gap-2">
          <button
            type="button"
            onClick={props.onCancel}
            class="text-sm border border-rim text-muted hover:bg-elevated px-3 py-1.5 rounded-lg transition-colors"
          >
            {t("wiki.cancel_edit")}
          </button>
          <Show when={props.onSaveDraft && body().trim()}>
            <button
              type="button"
              onClick={() => props.onSaveDraft!(body(), commitMsg())}
              class="text-sm border border-rim text-muted hover:bg-elevated px-3 py-1.5 rounded-lg transition-colors"
            >
              {t("editor.save_draft")}
            </button>
          </Show>
        </div>
        <button
          type="button"
          onClick={() => props.onSave(body(), commitMsg())}
          disabled={props.saving || !body().trim()}
          class="text-sm bg-accent text-accent-fg px-4 py-1.5 rounded-lg transition-opacity
                 hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {props.saving ? t("wiki.saving") : t("wiki.save")}
        </button>
      </div>
    </div>
  );
}
