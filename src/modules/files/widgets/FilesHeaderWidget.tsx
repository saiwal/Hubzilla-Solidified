import { useI18n } from "@/i18n";

export default function FilesHeaderWidget() {
  const { t } = useI18n();
  return (
    <div class="max-w-5xl mx-auto flex items-center gap-3">
      <h1 class="text-lg font-semibold text-txt">{t("nav.files")}</h1>
    </div>
  );
}
