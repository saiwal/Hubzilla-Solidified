import { Show } from "solid-js";
import { useI18n } from "@/i18n";
import { disabled } from "../store";

export default function PubstreamHeaderWidget() {
  const { t } = useI18n();

  return (
    <Show when={!disabled()}>
      <h1 class="text-xl font-bold">{t("pubstream.title")}</h1>
    </Show>
  );
}
