import { Show } from "solid-js";
import LanguageSwitcher from "./LanguageSwitcher";
import ThemeToggle from "./ThemeToggle";
import HelpTrigger from "./HelpTrigger";
import { A } from "@solidjs/router";
import { BiRegularInfoCircle } from "solid-icons/bi";
import { MdFillCheck, MdOutlineEdit } from "solid-icons/md";
import type { NavViewer, NavActions } from "@/shared/lib/nav-api";
import Usermenu from "./UserMenu";
import { useI18n } from "@/i18n";
import { helpable } from "@/shared/lib/helpable";
void helpable;
import { useViewerRole } from "@/shared/store/site-config";
import { editingWidgets, setEditingWidgets } from "@/shared/store/widget-layout";

interface NavUtilitiesProps {
  viewer?: NavViewer;
  actions?: NavActions;
  actionsOpen?: boolean;
  onUserMenuToggle?: () => void;
}

export default function NavUtilities(props: NavUtilitiesProps) {
  const { t } = useI18n();
  const viewerRole = useViewerRole();
  const isOwner = () => viewerRole() === "owner";
  return (
    <>
      <Usermenu
        viewer={props.viewer}
        actions={props.actions}
        actionsOpen={props.actionsOpen}
        onUserMenuToggle={props.onUserMenuToggle}
      />

      <div class="mt-3 pt-2 border-t border-rim flex items-center gap-0.5 px-1 justify-evenly">
        <div use:helpable="nav.language">
          <LanguageSwitcher />
        </div>
        <div use:helpable="nav.theme">
          <ThemeToggle />
        </div>
        <Show when={isOwner()}>
          <button
            onClick={() => setEditingWidgets(!editingWidgets())}
            aria-pressed={editingWidgets()}
            aria-label={editingWidgets() ? t("widgets.done_editing") : t("widgets.edit_layout")}
            title={editingWidgets() ? t("widgets.done_editing") : t("widgets.edit_layout")}
            class={`p-2 rounded-lg transition-colors ${
              editingWidgets()
                ? "bg-accent text-accent-fg"
                : "text-muted hover:bg-elevated hover:text-txt"
            }`}
          >
            <Show when={editingWidgets()} fallback={<MdOutlineEdit size={18} />}>
              <MdFillCheck size={18} />
            </Show>
          </button>
        </Show>
        <div use:helpable="nav.help_mode">
          <HelpTrigger />
        </div>
        <div use:helpable="nav.siteinfo">
          <A
            href="/siteinfo"
            title={t("ui.site_info")}
            class="inline-flex items-center justify-center p-2 rounded-lg text-muted hover:bg-elevated hover:text-txt transition-colors"
          >
            <BiRegularInfoCircle size={18} />
          </A>
        </div>
      </div>
    </>
  );
}
