import { onCleanup } from "solid-js";
import { toast } from "@utsukta/spa-core/store/toast";
import { useI18n } from "@utsukta/spa-core/i18n";

export function usePWA() {
  const { t } = useI18n();
  const handler = () => toast.info(t("ui.pwa_update"), 0, () => window.location.reload());
  window.addEventListener("pwa-update-available", handler);
  onCleanup(() => window.removeEventListener("pwa-update-available", handler));
}
