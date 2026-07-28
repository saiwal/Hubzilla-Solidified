/**
 * SlugField.tsx
 * Label + font-mono slug input + ↻ autofill-from-title button, shared by
 * Article and Webpage composers (Webpage previously had this button,
 * Article didn't — both now render the same component).
 */

import { Show, type Component } from "solid-js";
import { useI18n } from "@/i18n";
import { slugify } from "../lib/slugify";
import { underlineFieldClass } from "../lib/fieldStyles";

export interface SlugFieldProps {
  value: () => string;
  onInput: (v: string) => void;
  /** Source text the ↻ button derives the slug from (the composer's title signal). */
  title: () => string;
  /** Hide the "Slug" label above the input — the placeholder already names the field. */
  hideLabel?: boolean;
}

const SlugField: Component<SlugFieldProps> = (props) => {
  const { t } = useI18n();
  return (
    <div class="flex-1 min-w-0">
      <Show when={!props.hideLabel}>
        <label class="block text-xs text-muted mb-1">{t("editor.slug_label")}</label>
      </Show>
      <div class="flex items-center gap-1.5">
        <input
          type="text"
          placeholder={t("editor.slug_placeholder")}
          value={props.value()}
          onInput={(e) => props.onInput(e.currentTarget.value)}
          class={`flex-1 px-0 py-1.5 text-sm font-mono text-txt ${underlineFieldClass}`}
        />
        <button
          type="button"
          title={t("editor.generate_slug")}
          onClick={() => props.onInput(slugify(props.title()))}
          class="px-1 text-muted hover:text-txt transition-colors text-sm leading-none"
        >
          ↻
        </button>
      </div>
    </div>
  );
};

export default SlugField;
