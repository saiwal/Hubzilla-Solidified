import { registerModule } from "@utsukta/spa-core/module-registry";
import { useI18n } from "@utsukta/spa-core/i18n";

registerModule({
  id: "rmagic",
  routes: [
    { path: "/rmagic", component: () => import("./views/RmagicView") },
  ],
  navItem: {
    label: () => useI18n().t("nav.remote_login"),
    icon: "remote",
    path: "/rmagic",
    href: "/rmagic",
    context: "anonymous",
    hidden: true,
  },
  slots: {},
  permissions: [],
});
