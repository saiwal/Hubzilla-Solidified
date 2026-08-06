// src/modules/moderate/index.ts
import { registerModule } from "@/shared/lib/module-registry";
import { useI18n } from "@/i18n";

registerModule({
  id: "moderate",
  routes: [{ path: "/moderate", component: () => import("./views/ModerateView") }],
  navItem: {
    label: () => useI18n().t("nav.moderate"),
    icon: "moderate",
    path: "/moderate",
    href: "/moderate",
    context: ["owner", "local"],
  },
  requiresAuth: true,
  widgets: [],
  permissions: [],
});
