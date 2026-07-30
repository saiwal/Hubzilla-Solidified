import { Show, For } from "solid-js";
import { createQueryResource } from "@/shared/lib/createQueryResource";
import { fetchSiteInfo } from "../api";
import { bbcode } from "@/shared/lib/bbcode";
import DOMPurify from "dompurify";
import { useI18n } from "@/i18n";
import { useNavData } from "@/shared/store/nav-store";

export default function SiteinfoView() {
  const { t } = useI18n();
  const [info] = createQueryResource("siteinfo", fetchSiteInfo);
  const navData = useNavData();

  function formatLimit(n: number | null): string {
    return n === null ? t("ui.siteinfo_unlimited") : humanBytes(n);
  }
  function formatCount(n: number | null): string {
    return n === null ? t("ui.siteinfo_unlimited") : String(n);
  }

  return (
    <Show when={!info.loading} fallback={<SiteinfoPending />}>
      <Show when={info()} fallback={<p class="text-sm text-accent">{t("ui.siteinfo_load_failed")}</p>}>
        {(data) => (
          <div class="max-w-2xl mx-auto space-y-8">

            {/* Header card */}
            <div class="rounded-xl border border-rim bg-surface p-6">
              <div class="flex items-start gap-4">
									<img
										src={navData()?.sitelogo || import.meta.env.BASE_URL + "hubzilla.svg"}
										alt=""
										aria-hidden="true"
										class="h-20 w-20 shrink-0 rounded object-contain me-4"
									/>
                <div class="min-w-0">
                  <h1 class="text-xl font-bold text-txt truncate">
                    {data().site_name}
                  </h1>
                  <Show when={data().version}>
                    <p class="text-xs text-muted mt-0.5 font-mono">
                      v{data().version}
                    </p>
                  </Show>
                  <div class="mt-2">
                    <RegistrationBadge policy={data().registration} />
                  </div>
                </div>
              </div>
            </div>

            {/* About */}
            <Show when={data().site_about}>
              <Section title={t("ui.siteinfo_about")}>
                <div
                  class="prose prose-sm dark:prose-invert max-w-none text-txt
                           prose-a:text-accent prose-a:no-underline hover:prose-a:underline"
                  innerHTML={DOMPurify.sanitize(bbcode(data().site_about))}
                />
              </Section>
            </Show>

            {/* Admin */}
            <Show when={data().admin_about}>
              <Section title={t("ui.siteinfo_admin")}>
                <div
                  class="prose prose-sm dark:prose-invert max-w-none text-txt
                           prose-a:text-accent prose-a:no-underline hover:prose-a:underline"
                  innerHTML={DOMPurify.sanitize(bbcode(data().admin_about))}
                />
              </Section>
            </Show>

            {/* Federation */}
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
              </div>
            </Section>

            {/* Service classes */}
            <Show when={data().service_classes.length > 0}>
              <Section title={t("ui.siteinfo_service_classes")}>
                <div class="space-y-3">
                  <For each={data().service_classes}>
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
            </Show>

            {/* Addons + Themes side by side on wider screens */}
            <Show when={data().addons.length > 0 || data().themes.length > 0}>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Show when={data().addons.length > 0}>
                  <Section title={t("ui.siteinfo_addons")} compact>
                    <div class="flex flex-wrap gap-1.5">
                      <For each={data().addons}>
                        {(addon) => <Chip label={addon} />}
                      </For>
                    </div>
                  </Section>
                </Show>
                <Show when={data().themes.length > 0}>
                  <Section title={t("ui.siteinfo_themes")} compact>
                    <div class="flex flex-wrap gap-1.5">
                      <For each={data().themes}>
                        {(theme) => <Chip label={theme} />}
                      </For>
                    </div>
                  </Section>
                </Show>
              </div>
            </Show>

          </div>
        )}
      </Show>
    </Show>
  );
}

// ── Sub-components ──────────────────────────────────────────────────────────

function Section(props: { title: string; children: any; compact?: boolean }) {
  return (
    <section class={`rounded-xl border border-rim
                     bg-surface ${props.compact ? 'p-4' : 'p-6'}`}>
      <h2 class="text-sm font-semibold text-muted uppercase tracking-wider mb-3">
        {props.title}
      </h2>
      {props.children}
    </section>
  );
}

function humanBytes(n: number): string {
  if (n >= 1073741824) return `${(n / 1073741824).toFixed(1)} GB`;
  if (n >= 1048576) return `${(n / 1048576).toFixed(1)} MB`;
  if (n >= 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${n} B`;
}

function Chip(props: { label: string; variant?: 'info' | 'default' }) {
  const cls = () => props.variant === 'info'
    ? 'bg-accent-muted text-accent'
    : 'bg-overlay text-muted';
  return (
    <span class={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${cls()}`}>
      {props.label}
    </span>
  );
}

function RegistrationBadge(props: { policy: 0 | 1 | 2 }) {
  const { t } = useI18n();
  const label = () =>
    props.policy === 1 ? t("ui.siteinfo_open_reg")
    : props.policy === 2 ? t("ui.siteinfo_approval")
    : t("ui.siteinfo_closed");

  const cls = () =>
    props.policy === 1
      ? "bg-accent-muted text-accent"
      : props.policy === 2
      ? "bg-accent-muted text-accent"
      : "bg-accent-muted text-accent";

  return (
    <span class={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${cls()}`}>
      {label()}
    </span>
  );
}

function SiteinfoPending() {
  return (
    <div class="max-w-2xl mx-auto space-y-4 animate-pulse">
      <div class="rounded-xl border border-rim bg-surface p-6">
        <div class="flex items-start gap-4">
          <div class="w-12 h-12 rounded-xl bg-overlay shrink-0" />
          <div class="space-y-2 flex-1">
            <div class="h-5 w-48 rounded bg-overlay" />
            <div class="h-3 w-16 rounded bg-overlay" />
            <div class="h-5 w-24 rounded-md bg-overlay" />
          </div>
        </div>
      </div>
      <For each={Array(3).fill(0)}>
        {() => (
          <div class="rounded-xl border border-rim bg-surface p-6 space-y-3">
            <div class="h-3 w-20 rounded bg-overlay" />
            <div class="h-4 w-full rounded bg-overlay" />
            <div class="h-4 w-4/5 rounded bg-overlay" />
          </div>
        )}
      </For>
    </div>
  );
}
