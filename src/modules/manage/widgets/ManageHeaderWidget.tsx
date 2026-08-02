import { A } from "@solidjs/router";
import { useManageData } from "../store";
import { useI18n } from "@/i18n";

export default function ManageHeaderWidget() {
  const { t } = useI18n();
  const data = useManageData();

  return (
    <div class="flex items-center justify-between">
      <h1 class="text-xl font-bold">{t("manage.channels")}</h1>
      <A
        href={data()?.create_url ?? "/new_channel"}
        class="px-3 py-1.5 text-sm rounded-md font-medium
               bg-accent text-accent-fg hover:opacity-90 transition-opacity"
      >
        {t("manage.new_channel")}
      </A>
    </div>
  );
}
