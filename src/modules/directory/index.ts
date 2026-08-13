import { registerModule } from "@/shared/lib/module-registry";
import { useI18n } from "@/i18n";
import type { SubPageItem } from "@/shared/views/SubPageLayout";

export const CONNECTIONS_ITEMS: SubPageItem[] = [
  { path: "connections", label: () => useI18n().t("directory.connections"), context: "owner", requiresApp: "/connections" },
  { path: "contact-roles", label: () => useI18n().t("directory.contact_roles"), context: "owner", requiresApp: "/permcats" },
  {
    path: "privacy-groups",
    label: () => useI18n().t("directory.privacy_groups"),
    context: "owner",
    dividerAfter: true,
    requiresApp: "/group",
  },
  {
    path: "people",
    label: () => useI18n().t("directory.people_groups"),
    context: "all",
  },
  { path: "suggest", label: () => useI18n().t("directory.suggestions"), context: ["local", "owner"], requiresApp: "/suggest" },
  { path: "hubs", label: () => useI18n().t("directory.hubs"), context: "all" },
];

const subRoutes = CONNECTIONS_ITEMS.map((item) => ({
  path: `/directory/${item.path}`,
  component: () => import("./views/ConnectionsShellView"),
}));

registerModule({
  id: "directory",
  routes: [
    {
      path: "/directory",
      component: () => import("./views/ConnectionsShellView"),
    },
    {
      path: "/directory/*",
      component: () => import("./views/ConnectionsShellView"),
    },
    ...subRoutes,
  ],
  navItem: {
    label: () => useI18n().t("nav.directory"),
    icon: "directory",
    path: "/directory",
    href: "/directory",
    context: "all",
  },
  slots: {},
  permissions: [],
});
