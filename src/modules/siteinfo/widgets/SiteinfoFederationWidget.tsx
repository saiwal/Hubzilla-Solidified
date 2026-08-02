import { Show, For } from "solid-js";
import { useI18n } from "@/i18n";
import { useSiteinfo, Section, Chip, Centered } from "./shared";

export default function SiteinfoFederationWidget() {
  const { t } = useI18n();
  const info = useSiteinfo();

  return (
    <Show when={info()}>
      {(data) => (
        <Centered>
          <Section title={t("ui.siteinfo_federation")}>
            <div class="space-y-2">
              <p class="text-sm text-txt">
                {t("ui.siteinfo_powered_by")}{" "}
                <a
                  href={data().project_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  class="text-accent hover:underline"
                >
                  Hubzilla
                </a>
                <Show when={data().project_src}>
                  {" · "}
                  <a
                    href={data().project_src}
                    target="_blank"
                    rel="noopener noreferrer"
                    class="text-accent hover:underline"
                  >
                    {t("ui.siteinfo_source")}
                  </a>
                </Show>
              </p>
              <Show when={data().federated.length > 0}>
                <div class="flex flex-wrap gap-1.5 mt-2">
                  <For each={data().federated}>
                    {(proto) => <Chip label={proto} variant="info" />}
                  </For>
                </div>
              </Show>
              <Show when={data().blocked_sites.length > 0}>
                <p class="text-xs font-semibold text-muted uppercase tracking-wider mt-4 mb-1.5">
                  {t("ui.siteinfo_blocked_sites")}
                </p>
                <div class="flex flex-wrap gap-1.5">
                  <For each={data().blocked_sites}>
                    {(site) => <Chip label={site} />}
                  </For>
                </div>
              </Show>
            </div>
          </Section>
        </Centered>
      )}
    </Show>
  );
}
