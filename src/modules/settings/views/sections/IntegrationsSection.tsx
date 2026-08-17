import { Show, For, createSignal, createMemo } from "solid-js";
import { toast } from "@utsukta/spa-core/store/toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/solid-query";
import SubPageContent from "@/shared/views/SubPageContent";
import { apiFetch } from "@utsukta/spa-core/lib/fetch";
import { getNavIcon, biToNavIcon } from "@/shared/views/NavItem";
import { MdOutlineSettings } from "solid-icons/md";
import { refetchNavData } from "@utsukta/spa-core/store/nav-store";
import { useI18n } from "@utsukta/spa-core/i18n";
import { appLabel } from "@utsukta/spa-core/lib/app-labels";
import NsfwConfigModal from "./NsfwConfigModal";
import { getFrontendToggleableModules, frontendFeatureEnabled } from "@utsukta/spa-core/module-registry";
import { disabledFrontendModules, setFrontendModuleEnabled } from "@utsukta/spa-core/store/disabled-frontend-modules";

interface AppEntry {
  name: string;
  description: string;
  photo: string;
  installed: boolean;
  pinned: boolean;
  featured: boolean;
  requires: string;
}

type AppAction = "install" | "uninstall" | "nav";
type FilterTab = "all" | "installed" | "available";

async function fetchIntegrations(): Promise<AppEntry[]> {
  const res = await apiFetch("/spa/settings/integrations");
  if (!res.ok) throw new Error(`Failed to load apps: ${res.status}`);
  const { data } = await res.json();
  return data.apps as AppEntry[];
}

async function appAction(name: string, action: AppAction, enabled?: boolean): Promise<void> {
  const res = await apiFetch("/spa/settings/integrations", {
    method: "POST",
    body: JSON.stringify({ name, action, ...(enabled !== undefined ? { enabled } : {}) }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.error?.message ?? `Server error ${res.status}`);
  }
}

function AppIcon(props: { app: AppEntry }) {
  const { t } = useI18n();
  const biIcon = () => {
    const photo = props.app.photo;
    if (photo.startsWith("icon:")) return photo.slice(5);
    return "";
  };
  const iconKey = () => biToNavIcon(biIcon()) || props.app.name.toLowerCase();
  const isUrl = () => !props.app.photo.startsWith("icon:") && props.app.photo !== "";

  return (
    <Show
      when={isUrl()}
      fallback={
        <div class="w-9 h-9 rounded-lg bg-elevated flex items-center justify-center text-txt shrink-0">
          {getNavIcon(iconKey(), 18)}
        </div>
      }
    >
      <img
        src={props.app.photo}
        alt={appLabel(props.app.name, t)}
        class="w-9 h-9 rounded-lg object-cover shrink-0 bg-elevated p-2"
      />
    </Show>
  );
}

export default function IntegrationsSection() {
  const { t } = useI18n();
  const queryClient = useQueryClient();
  const query = useQuery(() => ({
    queryKey: ["settings", "integrations"] as const,
    queryFn: fetchIntegrations,
  }));
  const [search, setSearch] = createSignal("");
  const [filter, setFilter] = createSignal<FilterTab>("all");
  const [showNsfwConfig, setShowNsfwConfig] = createSignal(false);

  const apps = () => query.data ?? [];

  const filtered = createMemo(() => {
    const list = apps();
    const q = search().toLowerCase();
    return list.filter((app) => {
      if (filter() === "installed" && !app.installed) return false;
      if (filter() === "available" && app.installed) return false;
      if (
        q &&
        !appLabel(app.name, t).toLowerCase().includes(q) &&
        !app.description.toLowerCase().includes(q)
      )
        return false;
      return true;
    });
  });

  const appMutation = useMutation(() => ({
    mutationFn: ({ app, action, enabled }: { app: AppEntry; action: AppAction; enabled?: boolean }) =>
      appAction(app.name, action, enabled),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["settings", "integrations"] });
      refetchNavData();
    },
    onError: (e) => {
      toast.error(e instanceof Error ? e.message : "Unknown error");
    },
  }));

  // While the mutation is in flight, `variables` holds the pending {app, action}
  const isBusy = (name: string, action?: AppAction) =>
    appMutation.isPending &&
    appMutation.variables?.app.name === name &&
    (!action || appMutation.variables.action === action);

  const run = (app: AppEntry, action: AppAction, enabled?: boolean) =>
    appMutation.mutate({ app, action, enabled });

  const TABS: { value: FilterTab; labelKey: string }[] = [
    { value: "all",       labelKey: "settings.integ_tab_all" },
    { value: "installed", labelKey: "settings.integ_tab_installed" },
    { value: "available", labelKey: "settings.integ_tab_available" },
  ];

  return (
    <SubPageContent
      title={t("settings.title_integrations")}
      description={t("settings.desc_integrations")}
    >
      <div class="flex gap-2 flex-wrap">
        <div class="flex rounded-lg border border-rim overflow-hidden text-xs font-medium">
          <For each={TABS}>
            {(tab) => (
              <button
                type="button"
                onClick={() => setFilter(tab.value)}
                class={`px-3 py-1.5 transition-colors
                  ${filter() === tab.value
                    ? "bg-elevated text-txt"
                    : "text-muted hover:bg-elevated hover:text-txt"
                  }`}
              >
                {t(tab.labelKey as any)}
              </button>
            )}
          </For>
        </div>
        <input
          type="search"
          placeholder={t("settings.integ_search_placeholder")}
          value={search()}
          onInput={(e) => setSearch(e.currentTarget.value)}
          class="flex-1 min-w-1 px-3 py-1.5 text-sm rounded-lg bg-surface border border-rim
                 text-txt hover:border-rim-strong focus:outline-none focus:border-accent
                 placeholder:text-muted"
        />
      </div>

      <Show when={!query.isPending} fallback={<Skeleton />}>
        <Show
          when={filtered().length > 0}
          fallback={
            <p class="text-sm text-muted text-center py-8">{t("settings.integ_no_results")}</p>
          }
        >
          <div class="divide-y divide-rim">
            <For each={filtered()}>
              {(app) => (
                <div class="flex items-center gap-3 py-3">
                  <AppIcon app={app} />

                  <div class="flex-1 min-w-0">
                    <p class="text-sm font-medium text-txt leading-snug">{appLabel(app.name, t)}</p>
                    <Show when={app.description}>
                      <p class="text-xs text-muted truncate">{app.description}</p>
                    </Show>
                  </div>

                  {/* Show-in-nav toggle — only when installed */}
                  <Show when={app.installed}>
                    <div class="flex items-center gap-2 shrink-0">
                      <div class="flex flex-col items-center gap-1">
                        <span class="text-[10px] uppercase tracking-wide text-muted">
                          {t("settings.integ_nav_label")}
                        </span>
                        <button
                          type="button"
                          title={app.pinned || app.featured ? t("settings.integ_hide_nav") : t("settings.integ_show_nav")}
                          disabled={!!isBusy(app.name)}
                          onClick={() => run(app, "nav", !(app.pinned || app.featured))}
                          aria-pressed={app.pinned || app.featured}
                          class={[
                            "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
                            "focus:outline-none focus-visible:ring-2 focus-visible:ring-accent",
                            "disabled:opacity-40 disabled:cursor-not-allowed",
                            (app.pinned || app.featured) ? "bg-accent" : "bg-elevated border border-rim",
                          ].join(" ")}
                        >
                          <span class="sr-only">
                            {app.pinned || app.featured ? t("settings.integ_hide_nav") : t("settings.integ_show_nav")}
                          </span>
                          <span
                            class={[
                              "inline-block h-4 w-4 rounded-full transition-transform",
                              (app.pinned || app.featured) ? "translate-x-6 bg-accent-fg" : "translate-x-1 bg-muted",
                            ].join(" ")}
                          />
                        </button>
                      </div>

                      <Show when={app.name.toLowerCase() === "nsfw"}>
                        <button
                          type="button"
                          title={t("settings.integ_configure")}
                          onClick={() => setShowNsfwConfig(true)}
                          class="w-7 h-7 flex items-center justify-center rounded-lg transition-colors
                                 text-muted hover:bg-elevated hover:text-txt"
                        >
                          <MdOutlineSettings size={16} />
                        </button>
                      </Show>
                    </div>
                  </Show>

                  <div class="flex flex-col items-center gap-1 shrink-0">
                    <span class="text-[10px] uppercase tracking-wide text-muted">
                      {t("settings.integ_install_label")}
                    </span>
                    <button
                      type="button"
                      disabled={!!isBusy(app.name)}
                      onClick={() => run(app, app.installed ? "uninstall" : "install")}
                      aria-pressed={app.installed}
                      class={[
                        "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
                        "focus:outline-none focus-visible:ring-2 focus-visible:ring-accent",
                        "disabled:opacity-40 disabled:cursor-not-allowed",
                        app.installed ? "bg-accent" : "bg-elevated border border-rim",
                      ].join(" ")}
                    >
                      <span class="sr-only">
                        {app.installed ? t("settings.integ_remove") : t("settings.integ_install")}
                      </span>
                      <span
                        class={[
                          "inline-block h-4 w-4 rounded-full transition-transform",
                          app.installed ? "translate-x-6 bg-accent-fg" : "translate-x-1 bg-muted",
                        ].join(" ")}
                      />
                    </button>
                  </div>
                </div>
              )}
            </For>
          </div>
        </Show>
      </Show>

      <Show when={showNsfwConfig()}>
        <NsfwConfigModal onClose={() => setShowNsfwConfig(false)} />
      </Show>

      <FrontendFeaturesSection />
    </SubPageContent>
  );
}

function FrontendFeaturesSection() {
  const { t } = useI18n();
  const modules = getFrontendToggleableModules();

  return (
    <Show when={modules.length > 0}>
      <div class="pt-6 mt-2 border-t border-rim space-y-3">
        <div>
          <h3 class="text-sm font-medium text-txt">{t("settings.integ_frontend_title")}</h3>
          <p class="text-xs text-muted mt-0.5">{t("settings.integ_frontend_desc")}</p>
        </div>
        <div class="space-y-2">
          <For each={modules}>
            {(mod) => {
              const label = typeof mod.frontendFeature.label === "function"
                ? mod.frontendFeature.label()
                : mod.frontendFeature.label;
              const description = typeof mod.frontendFeature.description === "function"
                ? mod.frontendFeature.description()
                : mod.frontendFeature.description;
              const enabled = () =>
                frontendFeatureEnabled(mod.frontendFeature, mod.id, disabledFrontendModules());

              return (
                <div class="flex items-start gap-4 rounded-lg border border-rim bg-surface px-4 py-3">
                  <div class="flex-1 min-w-0">
                    <p class="text-sm font-medium text-txt">{label}</p>
                    <Show when={description}>
                      <p class="text-xs text-muted mt-0.5 leading-relaxed">{description}</p>
                    </Show>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFrontendModuleEnabled(mod.id, !enabled())}
                    aria-pressed={enabled()}
                    class={[
                      "shrink-0 relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
                      "focus:outline-none focus-visible:ring-2 focus-visible:ring-accent",
                      enabled() ? "bg-accent" : "bg-elevated border border-rim",
                    ].join(" ")}
                  >
                    <span class="sr-only">
                      {enabled() ? t("settings.feat_toggle_off") : t("settings.feat_toggle_on")}
                    </span>
                    <span
                      class={[
                        "inline-block h-4 w-4 rounded-full transition-transform",
                        enabled() ? "translate-x-6 bg-accent-fg" : "translate-x-1 bg-muted",
                      ].join(" ")}
                    />
                  </button>
                </div>
              );
            }}
          </For>
        </div>
      </div>
    </Show>
  );
}

function Skeleton() {
  return (
    <div class="divide-y divide-rim animate-pulse">
      <For each={[0, 1, 2, 3, 4, 5]}>
        {() => (
          <div class="flex items-center gap-3 py-3">
            <div class="w-9 h-9 rounded-lg bg-elevated shrink-0" />
            <div class="flex-1 space-y-1.5">
              <div class="h-3.5 w-32 rounded bg-elevated" />
              <div class="h-3 w-48 rounded bg-elevated" />
            </div>
            <div class="h-6 w-11 rounded-full bg-elevated" />
            <div class="h-6 w-11 rounded-full bg-elevated" />
          </div>
        )}
      </For>
    </div>
  );
}
