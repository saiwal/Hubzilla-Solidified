import { useI18n } from "@utsukta/spa-core/i18n";

export default function CalendarHeaderWidget() {
  const { t } = useI18n();
  return (
    <div class="max-w-5xl mx-auto flex items-center gap-3">
      <h1 class="text-lg font-semibold text-txt">{t("nav.calendar")}</h1>
    </div>
  );
}
