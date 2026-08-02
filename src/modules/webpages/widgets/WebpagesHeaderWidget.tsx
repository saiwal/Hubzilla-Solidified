import { Show } from 'solid-js';
import { A } from '@solidjs/router';
import { usePageNick } from '@/shared/store/site-config';
import { useI18n } from '@/i18n';
import { useIsWebpagesList } from '../lib/isWebpagesList';

export default function WebpagesHeaderWidget() {
  const { t } = useI18n();
  const nick = usePageNick();
  const isList = useIsWebpagesList();

  return (
    <Show when={isList()}>
      <div class="max-w-3xl mx-auto px-4 md:px-6 pt-6">
        <div class="flex items-center justify-between gap-4">
          <h1 class="text-lg font-semibold text-txt">{t('webpages.title')}</h1>
          <div class="flex items-center gap-2">
            <A
              href={`/webpages/${nick()}/menus`}
              class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-rim
                     text-txt text-sm hover:bg-elevated transition-colors"
            >
              {t('webpages.manage_menus')}
            </A>
            <A
              href={`/webpages/${nick()}/layouts`}
              class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-rim
                     text-txt text-sm hover:bg-elevated transition-colors"
            >
              {t('webpages.manage_layouts')}
            </A>
            <A
              href={`/webpages/${nick()}/new`}
              class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent
                     text-accent-fg text-sm hover:opacity-90 transition-opacity"
            >
              + {t('webpages.new_page')}
            </A>
          </div>
        </div>
        <div class="border-t border-rim mt-4" />
      </div>
    </Show>
  );
}
