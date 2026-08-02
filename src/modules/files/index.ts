import { registerModule } from "@/shared/lib/module-registry";
import { useI18n } from "@/i18n";
import { usePageNick } from "@/shared/store/site-config";

registerModule({
  id: "cloud",
  routes: [
    { path: "/cloud", component: () => import("./views/FilesView") },
    { path: "/cloud/:nick", component: () => import("./views/FilesView") },
    { path: "/cloud/:nick/*", component: () => import("./views/FilesView") },
  ],

  navItem: {
    label: () => useI18n().t("nav.files"),
    icon: "files",
    path: "/cloud",
    href: () => `/cloud/${usePageNick()()}`,
		context: "all",
  },
  widgets: [
    {
      id: "cloud.header",
      label: () => useI18n().t("widgets.cloud_header"),
      loader: () => import("./widgets/FilesHeaderWidget"),
      slot: "header",
      defaultModules: ["cloud"],
      contexts: ["cloud"],
      locked: true,
    },
    {
      id: "cloud.content",
      label: () => useI18n().t("widgets.cloud_content"),
      loader: () => import("./widgets/FilesContentWidget"),
      slot: "contentTop",
      defaultModules: ["cloud"],
      contexts: ["cloud"],
      locked: true,
    },
  ],
  permissions: [],
  appName: "Files",
});
