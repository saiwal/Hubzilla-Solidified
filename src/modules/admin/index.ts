import { registerModule } from "@/shared/lib/module-registry";
import { useI18n } from "@/i18n";
import type { SubPageItem } from "@/shared/views/SubPageLayout";

export const ADMIN_ITEMS: SubPageItem[] = [
  { path: "summary", label: "Summary" },
  { path: "site", label: "Site" },
  { path: "accounts", label: "Accounts" },
  { path: "service-classes", label: "Service Classes" },
  { path: "channels", label: "Channels" },
  { path: "security", label: "Security" },
  { path: "features", label: "Features" },
  { path: "addons", label: "Addons" },
  { path: "themes", label: "Themes" },
  { path: "inspect-queue", label: "Inspect Queue" },
  { path: "queueworker", label: "Queueworker" },
  { path: "profile-fields", label: "Profile Fields" },
  { path: "db-updates", label: "DB Updates" },
  { path: "logs", label: "Logs" },
];
// Derive all sub-routes from ADMIN_ITEMS so the list is always in sync.
// Every path points to the same SettingsView — it does the section switching.
const adminRoutes = ADMIN_ITEMS.map((item) => ({
  path: `/admin/${item.path}`,
  component: () => import("./views/AdminView"),
}));

registerModule({
  id: "admin",
  routes: [
    { path: "/admin", component: () => import("./views/AdminView") },
    ...adminRoutes,
  ],
  requiresAuth: true,

  navItem: {
    label: () => useI18n().t("nav.admin"),
    icon: "admin",
    path: "/admin",
    href: "/admin",
    context: ["admin"],
    hidden: true,
  },
  slots: {},
  widgets: [
    {
      // HQ's right sidebar only (not global) — editable inline by admins.
      // Module-scoped entries render in Slot.tsx after the slot's global
      // widgets (chat.pinnedRooms, shared.notifications), so this lands
      // below Notifications there without needing an explicit order field.
      // Self-hides via the widget's own <Show> when there's nothing to
      // show, same as chat.pinnedRooms — no mainTop margin gap since it's
      // not placed in mainTop's masonry columns.
      id: "admin.site_announcements",
      label: () => useI18n().t("widgets.site_announcements"),
      loader: () => import("./widgets/SiteAnnouncementsWidget"),
      slot: "right",
      defaultModules: ["hq"],
      contexts: ["hq"],
      visitorVisible: false,
    },
  ],
});
