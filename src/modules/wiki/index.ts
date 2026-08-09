// src/modules/wiki/index.ts
import { registerModule } from "@/shared/lib/module-registry";
import { useI18n } from "@/i18n";
import { usePageNick } from "@/shared/store/site-config";

registerModule({
  id: "wiki",
  routes: [
    // Specific routes must precede the general one (same rule as articles)
    {
      path: "/wiki/:nick/:wikiName/:pageName",
      component: () => import("./views/WikiPageView"),
    },
    {
      path: "/wiki/:nick/:wikiName",
      component: () => import("./views/WikiPagesView"),
    },
    {
      path: "/wiki/:nick",
      component: () => import("./views/WikiListView"),
    },
  ],
  navItem: {
    label: () => useI18n().t("nav.wiki"),
    icon: "wiki",
    path: "/wiki",
    href: () => `/wiki/${usePageNick()()}`,
    // Wiki surfaces as a channel tab (via wiki_channel_apps hook → Hubzilla nav API),
    // not a standalone sidebar item — keep hidden from the main nav.
		context: 'all',
  },
  widgets: [
    {
      id: "wiki.header",
      label: () => useI18n().t("widgets.wiki_header"),
      loader: () => import("./widgets/WikiHeaderWidget"),
      slot: "header",
      defaultModules: ["wiki"],
      contexts: ["wiki"],
      locked: true,
    },
    {
      id: "wiki.content",
      label: () => useI18n().t("widgets.wiki_content"),
      loader: () => import("./widgets/WikiContentWidget"),
      slot: "contentTop",
      defaultModules: ["wiki"],
      contexts: ["wiki"],
      locked: true,
    },
    {
      id: "wiki.list",
      label: () => useI18n().t("widgets.wiki_list"),
      loader: () => import("./widgets/WikiListWidget"),
      slot: "right",
      defaultModules: ["wiki"],
			contexts: "any",
      helpTarget: "wiki.wiki_list_widget",
    },
    {
      id: "wiki.drafts",
      label: () => useI18n().t("widgets.wiki_drafts"),
      loader: () => import("./widgets/WikiDraftsWidget"),
      slot: "right",
      defaultModules: ["wiki"],
      visitorVisible: false,
      helpTarget: "wiki.drafts_widget",
    },
  ],
  slots: {},
  permissions: [],
  appUrlSlug: "/wiki/",
});
