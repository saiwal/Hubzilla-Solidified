import { useI18n } from "@/i18n";

export default function NetworkHeaderWidget() {
  const { t } = useI18n();
  return <h1 class="text-xl font-bold">{t("nav.network")}</h1>;
}
