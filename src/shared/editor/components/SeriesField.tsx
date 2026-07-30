/**
 * SeriesField.tsx
 * Optional "Series name" + "Part #" pair for ArticleComposer. Both empty
 * means the article isn't part of a series — stored via iconfig, not a
 * dedicated schema field (see Articles.php).
 */

import { Show, type Component } from "solid-js";
import { useI18n } from "@/i18n";
import { underlineFieldClass } from "../lib/fieldStyles";

export interface SeriesFieldProps {
  name: () => string;
  onNameInput: (v: string) => void;
  order: () => number | null;
  onOrderInput: (v: number | null) => void;
  hideLabel?: boolean;
}

const SeriesField: Component<SeriesFieldProps> = (props) => {
  const { t } = useI18n();
  return (
    <div class="flex items-end gap-3">
      <div class="flex-1 min-w-0">
        <Show when={!props.hideLabel}>
          <label class="block text-xs text-muted mb-1">{t("editor.series_label")}</label>
        </Show>
        <input
          type="text"
          placeholder={t("editor.series_placeholder")}
          value={props.name()}
          onInput={(e) => props.onNameInput(e.currentTarget.value)}
          class={`w-full px-0 py-1.5 text-sm text-txt placeholder:text-muted ${underlineFieldClass}`}
        />
      </div>
      <div class="w-20 shrink-0">
        <Show when={!props.hideLabel}>
          <label class="block text-xs text-muted mb-1">{t("editor.series_order_label")}</label>
        </Show>
        <input
          type="number"
          min="1"
          placeholder={t("editor.series_order_placeholder")}
          value={props.order() ?? ""}
          onInput={(e) => {
            const v = e.currentTarget.value;
            props.onOrderInput(v === "" ? null : Number(v));
          }}
          class={`w-full px-0 py-1.5 text-sm text-txt placeholder:text-muted ${underlineFieldClass}`}
        />
      </div>
    </div>
  );
};

export default SeriesField;
