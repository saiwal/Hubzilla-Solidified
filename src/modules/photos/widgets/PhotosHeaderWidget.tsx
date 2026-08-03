import { useI18n } from "@/i18n";

export default function PhotosHeaderWidget() {
  const { t } = useI18n();
  return (
    <div class="max-w-5xl mx-auto space-y-3">
      <h1 class="text-lg font-semibold text-txt">{t("nav.photos")}</h1>
    </div>
  );
}
