import { Show } from "solid-js";
import DOMPurify from "dompurify";
import { bbcode } from "@utsukta/spa-core/lib/bbcode";
import { useI18n } from "@utsukta/spa-core/i18n";
import { useSiteinfo, Section, Centered } from "./shared";

export default function SiteinfoAboutWidget() {
  const { t } = useI18n();
  const info = useSiteinfo();

  return (
    <Show when={info()?.site_about}>
      {(about) => (
        <Centered>
          <Section title={t("ui.siteinfo_about")}>
            <div
              class="prose prose-sm dark:prose-invert max-w-none text-txt
                       prose-a:text-accent prose-a:no-underline prose-a:hover:underline"
              innerHTML={DOMPurify.sanitize(bbcode(about()))}
            />
          </Section>
        </Centered>
      )}
    </Show>
  );
}
