/**
 * ListToolDropdown.tsx
 * Groups the list tools (bullet / numbered / lettered) behind one icon
 * button in EditorToolbar, matching EmojiPicker's icon-trigger + floating
 * panel pattern instead of a native <select>.
 */

import { createSignal, Show, onMount, onCleanup } from "solid-js";
import { MdOutlineFormat_list_bulleted, MdOutlineFormat_list_numbered } from "solid-icons/md";
import { useI18n } from "@utsukta/spa-core/i18n";

export type ListKind = "bullet" | "number" | "alpha";

export interface ListToolDropdownProps {
  disabled?: boolean;
  onSelect: (kind: ListKind) => void;
}

export default function ListToolDropdown(props: ListToolDropdownProps) {
  const { t } = useI18n();
  const [open, setOpen] = createSignal(false);
  const [panelStyle, setPanelStyle] = createSignal<{ top: string; left: string }>({ top: "auto", left: "auto" });

  let triggerRef: HTMLButtonElement | undefined;
  let panelRef: HTMLDivElement | undefined;

  const updatePosition = () => {
    if (!triggerRef) return;
    const r = triggerRef.getBoundingClientRect();
    setPanelStyle({ top: `${r.bottom + 4}px`, left: `${r.left}px` });
  };

  const handleDocClick = (e: MouseEvent) => {
    if (!open()) return;
    const target = e.target as Node;
    if (panelRef?.contains(target) || triggerRef?.contains(target)) return;
    setOpen(false);
  };

  onMount(() => {
    document.addEventListener("click", handleDocClick, { capture: true });
    window.addEventListener("resize", updatePosition);
  });
  onCleanup(() => {
    document.removeEventListener("click", handleDocClick, { capture: true });
    window.removeEventListener("resize", updatePosition);
  });

  function toggle() {
    if (props.disabled) return;
    if (!open()) updatePosition();
    setOpen((o) => !o);
  }

  function select(kind: ListKind) {
    props.onSelect(kind);
    setOpen(false);
  }

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        title={t("editor.list_toolbar_title")}
        disabled={props.disabled}
        onMouseDown={(e) => e.preventDefault()}
        onClick={toggle}
        class={
          "px-1.5 py-0.5 rounded transition-colors " +
          (props.disabled
            ? "text-muted/40 cursor-not-allowed"
            : `text-txt hover:bg-elevated ${open() ? "bg-elevated" : ""}`)
        }
      >
        <MdOutlineFormat_list_bulleted class="w-4 h-4" />
      </button>

      <Show when={open()}>
        <div
          ref={panelRef}
          class="fixed z-50 w-44 py-1 bg-surface border border-rim rounded-lg shadow-xl flex flex-col"
          style={panelStyle()}
        >
          <button
            type="button"
            onClick={() => select("bullet")}
            class="flex items-center gap-2 px-3 py-1.5 text-xs text-txt hover:bg-elevated transition-colors text-left"
          >
            <MdOutlineFormat_list_bulleted class="w-4 h-4 shrink-0" />
            {t("editor.bullet_list")}
          </button>
          <button
            type="button"
            onClick={() => select("number")}
            class="flex items-center gap-2 px-3 py-1.5 text-xs text-txt hover:bg-elevated transition-colors text-left"
          >
            <MdOutlineFormat_list_numbered class="w-4 h-4 shrink-0" />
            {t("editor.numbered_list")}
          </button>
          <button
            type="button"
            onClick={() => select("alpha")}
            class="flex items-center gap-2 px-3 py-1.5 text-xs text-txt hover:bg-elevated transition-colors text-left"
          >
            <span class="w-4 h-4 shrink-0 flex items-center justify-center text-[0.625rem] font-semibold">abc</span>
            {t("editor.lettered_list")}
          </button>
        </div>
      </Show>
    </>
  );
}
