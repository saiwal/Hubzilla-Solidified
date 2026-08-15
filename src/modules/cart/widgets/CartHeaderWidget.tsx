import { Show } from "solid-js";
import { useI18n } from "@utsukta/spa-core/i18n";
import { useViewerRole } from "@utsukta/spa-core/store/site-config";
import { cartCount, tab, switchTab } from "../store";

export default function CartHeaderWidget() {
  const { t } = useI18n();
  const viewerRole = useViewerRole();
  const isOwner = () => viewerRole() === "owner";

  const tabs = [
    { id: "catalog" as const, label: () => t("cart.catalog_tab") },
    { id: "cart" as const, label: () => t("cart.cart_tab") },
  ];

  return (
    <div class="max-w-5xl mx-auto flex items-center gap-3 flex-wrap">
      <h1 class="text-lg font-semibold text-txt">{t("nav.cart")}</h1>

      <div class="flex gap-1 p-1 bg-elevated rounded-lg w-fit mx-auto">
        {tabs.map((s) => (
          <button
            onClick={() => switchTab(s.id)}
            class={`px-3 text-center text-xs py-1 rounded-md transition-colors font-medium
              ${
                tab() === s.id
                  ? "bg-accent text-accent-fg font-semibold"
                  : "text-muted hover:text-txt"
              }`}
          >
            {s.label()}
            <Show when={s.id === "cart" && cartCount() > 0}>
              {" "}({cartCount()})
            </Show>
          </button>
        ))}
        <Show when={isOwner()}>
          <button
            onClick={() => switchTab("orders")}
            class={`px-3 text-center text-xs py-1 rounded-md transition-colors font-medium
              ${
                tab() === "orders"
                  ? "bg-accent text-accent-fg font-semibold"
                  : "text-muted hover:text-txt"
              }`}
          >
            {t("cart.orders_tab")}
          </button>
        </Show>
      </div>
    </div>
  );
}
