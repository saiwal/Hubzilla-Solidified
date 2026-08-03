// src/modules/pubstream/index.ts
import { registerModule } from "@/shared/lib/module-registry";
import { useI18n } from "@/i18n";


registerModule({
  id: "pubstream",
  routes: [
    {
      path: "/pubstream",
      component: () => import("./views/PubstreamView"),
    },
  ],
  navItem: {
    path: "/pubstream",
    label: () => useI18n().t("nav.pubstream"),
    icon: "pubstream",
		href: "/pubstream",
		context: "all",
  },
  widgets: [
    {
      id: "pubstream.content",
      label: () => useI18n().t("widgets.pubstream_content"),
      loader: () => import("./widgets/PubstreamContentWidget"),
      slot: "contentTop",
      defaultModules: ["pubstream"],
      contexts: ["pubstream"],
      locked: true,
    },
  ],
  appName: "Public Stream",
});
