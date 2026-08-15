import { Show, For } from "solid-js";
import { useI18n } from "@utsukta/spa-core/i18n";
import { useSiteinfo, Section, Chip, Centered } from "./shared";

export default function SiteinfoAddonsWidget() {
  const { t } = useI18n();
  const info = useSiteinfo();

  return (
    <Show when={(info()?.addons.length ?? 0) > 0}>
      <Centered>
        <Section title={t("ui.siteinfo_addons")} compact>
          <div class="flex flex-wrap gap-1.5">
            <For each={info()!.addons}>
              {(addon) => <Chip label={addon} />}
            </For>
          </div>
        </Section>
      </Centered>
    </Show>
  );
}
