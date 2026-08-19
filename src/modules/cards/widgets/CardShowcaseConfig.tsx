// Settings form for CardShowcaseWidget instances: pick one of the channel's
// cards.

import { createSignal, For } from "solid-js";
import { createQueryResource } from "@utsukta/spa-core/lib/createQueryResource";
import type { WidgetConfigProps } from "@utsukta/spa-core/types/module.types";
import { usePageNick } from "@utsukta/spa-core/store/site-config";
import { useI18n } from "@utsukta/spa-core/i18n";
import { fetchCards } from "../api";

export default function CardShowcaseConfig(props: WidgetConfigProps) {
  const { t } = useI18n();
  const nick = usePageNick();
  const [uuid, setUuid] = createSignal(String(props.config.uuid ?? ""));

  const [cards] = createQueryResource(
    "cards-list",
    () => nick() || null,
    async (n) => (await fetchCards(n)).cards,
  );

  return (
    <div class="flex flex-col gap-2">
      <label class="text-xs text-muted">
        {t("widgets.cfg_card")}
        <select
          value={uuid()}
          onChange={(e) => setUuid(e.currentTarget.value)}
          class="mt-1 w-full bg-elevated border border-rim rounded-lg px-2 py-1.5 text-xs text-txt"
        >
          <option value="">—</option>
          <For each={cards() ?? []}>
            {(a) => <option value={a.uuid}>{a.title || a.created.slice(0, 10)}</option>}
          </For>
        </select>
      </label>
      <button
        onClick={() => props.onSave({ uuid: uuid() })}
        disabled={!uuid()}
        class="self-end px-3 py-1.5 rounded-lg bg-accent text-accent-fg text-xs font-medium
               hover:brightness-110 transition-all disabled:opacity-40"
      >
        {t("widgets.cfg_save")}
      </button>
    </div>
  );
}
