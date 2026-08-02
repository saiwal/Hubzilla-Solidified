import { useI18n } from "@/i18n";

export default function CalendarHeaderWidget() {
  const { t } = useI18n();
  return <h1 class="text-lg font-semibold text-txt">{t("nav.calendar")}</h1>;
}
