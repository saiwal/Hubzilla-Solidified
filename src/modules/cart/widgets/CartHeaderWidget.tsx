import { useI18n } from "@/i18n";

export default function CartHeaderWidget() {
  const { t } = useI18n();
  return <h1 class="text-lg font-semibold text-txt">{t("nav.cart")}</h1>;
}
