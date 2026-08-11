import { registerModule } from "@/shared/lib/module-registry";
import { useI18n } from "@/i18n";
import { usePageNick } from "@/shared/store/site-config";

registerModule({
  id: "cart",
  routes: [
    { path: "/cart", component: () => import("./views/CartView") },
    { path: "/cart/:nick", component: () => import("./views/CartView") },
  ],

  navItem: {
    label: () => useI18n().t("nav.cart"),
    icon: "cart",
    path: "/cart",
    href: () => `/cart/${usePageNick()()}`,
		context: "all",
  },
  widgets: [
    {
      id: "cart.header",
      label: () => useI18n().t("widgets.cart_header"),
      loader: () => import("./widgets/CartHeaderWidget"),
      slot: "header",
      defaultModules: ["cart"],
      contexts: ["cart"],
      locked: true,
    },
    {
      id: "cart.content",
      label: () => useI18n().t("widgets.cart_content"),
      loader: () => import("./widgets/CartContentWidget"),
      slot: "contentTop",
      defaultModules: ["cart"],
      contexts: ["cart"],
      locked: true,
    },
    {
      id: "cart.cart",
      label: () => useI18n().t("widgets.shopping_cart"),
      loader: () => import("./widgets/CartWidget"),
      slot: "right",
      helpTarget: "cart.shopping_cart_widget",
    },
    {
      // Opt-in showcase card; place several, each configured with its own sku
      id: "cart.item_card",
      label: () => useI18n().t("widgets.item_card"),
      loader: () => import("./widgets/ItemCardWidget"),
      slot: "right",
      defaultModules: [],
      contexts: ["channel", "profile", "cart"],
      multiInstance: true,
      configComponent: () => import("./widgets/ItemCardConfig"),
      helpTarget: "widgets.shop_item_card",
    },
  ],
  permissions: [],
});
