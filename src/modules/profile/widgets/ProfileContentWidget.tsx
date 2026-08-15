import { useI18n } from "@utsukta/spa-core/i18n";
import { usePageNick } from "@utsukta/spa-core/store/site-config";
import ProfileView from "@/modules/channel/views/ProfileView";

export default function ProfileContentWidget() {
  const { t } = useI18n();
  const nick = usePageNick();

  return (
    <div class="max-w-3xl mx-auto py-4 px-2">
      <ProfileView full />
      <div class="mt-3 text-center">
        <a
          href={`/channel/${nick()}`}
          class="inline-flex items-center gap-1.5 text-sm text-muted hover:text-accent transition-colors"
        >
          {t("nav.channel")} →
        </a>
      </div>
    </div>
  );
}
