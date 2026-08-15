import { Show, For } from "solid-js";
import { useI18n } from "@utsukta/spa-core/i18n";
import { useSiteinfo, Section, Chip, Centered } from "./shared";

export default function SiteinfoThemesWidget() {
  const { t } = useI18n();
  const info = useSiteinfo();

  return (
    <Show when={(info()?.themes.length ?? 0) > 0}>
      <Centered>
        <Section title={t("ui.siteinfo_themes")} compact>
          <div class="flex flex-wrap gap-1.5">
            <For each={info()!.themes}>
              {(theme) => <Chip label={theme} />}
            </For>
          </div>
        </Section>
      </Centered>
    </Show>
  );
}
