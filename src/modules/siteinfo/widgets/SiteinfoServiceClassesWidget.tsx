import { Show, For } from "solid-js";
import { useI18n } from "@/i18n";
import { useSiteinfo, Section, Chip, humanBytes, Centered } from "./shared";

export default function SiteinfoServiceClassesWidget() {
  const { t } = useI18n();
  const info = useSiteinfo();

  function formatLimit(n: number | null): string {
    return n === null ? t("ui.siteinfo_unlimited") : humanBytes(n);
  }
  function formatCount(n: number | null): string {
    return n === null ? t("ui.siteinfo_unlimited") : String(n);
  }

  return (
    <Show when={(info()?.service_classes.length ?? 0) > 0}>
      <Centered>
        <Section title={t("ui.siteinfo_service_classes")}>
          <div class="space-y-3">
            <For each={info()!.service_classes}>
              {(cls) => (
                <div class="rounded-lg border border-rim p-3 space-y-2">
                  <div class="flex items-center gap-2">
                    <span class="text-sm font-medium text-txt">{cls.name}</span>
                    <Show when={cls.is_default}>
                      <Chip label={t("ui.siteinfo_default_badge")} variant="info" />
                    </Show>
                  </div>
                  <div class="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-1 text-xs text-muted">
                    <div>{t("ui.siteinfo_photo_limit")}: {formatLimit(cls.photo_upload_limit)}</div>
                    <div>{t("ui.siteinfo_attach_limit")}: {formatLimit(cls.attach_upload_limit)}</div>
                    <div>{t("ui.siteinfo_total_channels")}: {formatCount(cls.total_channels)}</div>
                    <div>{t("ui.siteinfo_total_items")}: {formatCount(cls.total_items)}</div>
                    <div>{t("ui.siteinfo_total_identities")}: {formatCount(cls.total_identities)}</div>
                  </div>
                </div>
              )}
            </For>
          </div>
        </Section>
      </Centered>
    </Show>
  );
}
