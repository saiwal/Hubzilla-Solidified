import { useNavigate } from "@solidjs/router";
import { useI18n } from "@utsukta/spa-core/i18n";

export default function NotFound() {
  const { t } = useI18n();
  const navigate = useNavigate();

  return (
    <div class="flex flex-col items-center justify-center min-h-[60vh] gap-4 p-8 text-center">
      <span aria-hidden="true" class="text-8xl font-bold text-gray-300 select-none">404</span>
      <h1 class="text-2xl font-semibold">{t("ui.not_found_title")}</h1>
      <p class="max-w-sm">{t("ui.not_found_desc")}</p>
      <button
        onClick={() => navigate("/hq", { replace: true })}
        class="mt-2 px-4 py-2 rounded-lg border hover:opacity-90 transition-opacity"
      >
        {t("ui.go_home")}
      </button>
    </div>
  );
}
