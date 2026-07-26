import { For, Show } from "solid-js";
import SubPageContent from "@/shared/views/SubPageContent";
import { fetchAccountSettings } from "../../api/api";
import { useSectionForm } from "../../store/useSectionForm";
import type { AccountQuota, QuotaKey } from "../../store/types";
import { useI18n } from "@/i18n";

const BYTE_KEYS: readonly QuotaKey[] = ["photo_upload_limit", "attach_upload_limit"];

function humanBytes(n: number): string {
  if (n >= 1073741824) return `${(n / 1073741824).toFixed(1)} GB`;
  if (n >= 1048576) return `${(n / 1048576).toFixed(1)} MB`;
  if (n >= 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${n} B`;
}

function formatQuotaValue(key: QuotaKey, n: number): string {
  return BYTE_KEYS.includes(key) ? humanBytes(n) : String(n);
}

export default function AccountSection() {
  const { t } = useI18n();
  const { data, saving, handleSubmit } = useSectionForm({
    section: "account",
    fetcher: fetchAccountSettings,
    saver: async () => {}, // account email change not yet wired in PHP
  });

  return (
    <SubPageContent title={t("settings.title_account")} description={t("settings.desc_account")}>
      <Show when={data()} fallback={<Skeleton />}>
        <form onSubmit={handleSubmit} class="space-y-6">
          <Field label={t("settings.email")}>
            <input
              type="email"
              name="email"
              value={data()!.$email}
              class="w-full max-w-sm px-3 py-2 rounded-lg border border-rim bg-surface
                     text-txt hover:border-rim-strong focus:outline-none
                     focus:border-rim-strong transition-colors text-sm"
            />
          </Field>

          <div class="flex items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={saving()}
              class="px-4 py-2 text-sm font-medium rounded-lg bg-accent text-accent-fg
                     hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
            >
              {saving() ? t("settings.saving") : t("settings.save")}
            </button>
          </div>
        </form>

        <Show when={data()!.quotas.length > 0}>
          <div class="space-y-3 pt-2 border-t border-rim">
            <h3 class="text-sm font-semibold text-txt pt-4">{t("settings.quotas_title")}</h3>
            <p class="text-xs text-muted -mt-2">{t("settings.quotas_desc")}</p>
            <div class="space-y-3">
              <For each={data()!.quotas}>
                {(q) => <QuotaRow quota={q} />}
              </For>
            </div>
          </div>
        </Show>
      </Show>
    </SubPageContent>
  );
}

function QuotaRow(props: { quota: AccountQuota }) {
  const { t } = useI18n();
  const label = () => t(`settings.quota_${props.quota.key}` as any);
  const pct = () => {
    const { usage, limit } = props.quota;
    if (usage === null || !limit) return null;
    return Math.min(100, Math.round((usage / limit) * 100));
  };

  return (
    <div class="space-y-1">
      <div class="flex items-center justify-between text-xs">
        <span class="text-txt">{label()}</span>
        <span class="text-muted">
          <Show
            when={props.quota.usage !== null}
            fallback={formatQuotaValue(props.quota.key, props.quota.limit)}
          >
            {formatQuotaValue(props.quota.key, props.quota.usage!)} / {formatQuotaValue(props.quota.key, props.quota.limit)}
          </Show>
        </span>
      </div>
      <Show when={pct() !== null}>
        <div class="h-1.5 rounded-full bg-elevated overflow-hidden">
          <div
            class="h-full rounded-full bg-accent transition-all"
            classList={{ "bg-red-500": (pct() ?? 0) >= 90 }}
            style={{ width: `${pct()}%` }}
          />
        </div>
      </Show>
    </div>
  );
}

function Field(props: { label: string; hint?: string; children: any }) {
  return (
    <div class="space-y-1.5">
      <label class="block text-sm font-medium text-txt">{props.label}</label>
      {props.children}
      <Show when={props.hint}>
        <p class="text-xs text-muted">{props.hint}</p>
      </Show>
    </div>
  );
}

function Skeleton() {
  return (
    <div class="space-y-5 animate-pulse">
      <div class="h-3.5 w-32 rounded bg-elevated" />
      <div class="h-9 w-64 rounded-lg bg-elevated" />
    </div>
  );
}
