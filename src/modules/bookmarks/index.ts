// src/modules/bookmarks/index.ts
import { registerModule } from "@/shared/lib/module-registry";
import { useI18n } from "@/i18n";

registerModule({
  id: "bookmarks",
  routes: [
    { path: "/bookmarks", component: () => import("./views/BookmarksView") },
  ],
  requiresAuth: true,
  navItem: {
    label: () => useI18n().t("nav.bookmarks"),
    icon: "bookmark",
    path: "/bookmarks",
    href: "/bookmarks",
    context: "local",
  },
  widgets: [
    {
      id: "bookmarks.header",
      label: () => useI18n().t("widgets.bookmarks_header"),
      loader: () => import("./widgets/BookmarksHeaderWidget"),
      slot: "header",
      defaultModules: ["bookmarks"],
      contexts: ["bookmarks"],
      locked: true,
    },
    {
      id: "bookmarks.content",
      label: () => useI18n().t("widgets.bookmarks_content"),
      loader: () => import("./widgets/BookmarksContentWidget"),
      slot: "contentTop",
      defaultModules: ["bookmarks"],
      contexts: ["bookmarks"],
      locked: true,
    },
  ],
  permissions: [],
});
