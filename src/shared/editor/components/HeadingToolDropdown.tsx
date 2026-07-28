/**
 * HeadingToolDropdown.tsx
 * Icon-trigger + floating panel for the heading tool in EditorToolbar —
 * same pattern as ListToolDropdown, replacing the old native <select> that
 * showed "Heading…"/H1…H6 as visible text on the toolbar itself.
 */

import { createSignal, Show, For, onMount, onCleanup } from "solid-js";
import { MdOutlineTitle } from "solid-icons/md";
import { useI18n } from "@/i18n";

export interface HeadingToolDropdownProps {
  disabled?: boolean;
  /** "p" resets to a plain paragraph; "h1"–"h6" apply that heading level. */
  onSelect: (value: string) => void;
}

const LEVELS = ["h1", "h2", "h3", "h4", "h5", "h6"] as const;

export default function HeadingToolDropdown(props: HeadingToolDropdownProps) {
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

  function select(value: string) {
    props.onSelect(value);
    setOpen(false);
  }

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        title={t("editor.heading")}
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
        <MdOutlineTitle class="w-4 h-4" />
      </button>

      <Show when={open()}>
        <div
          ref={panelRef}
          class="fixed z-50 w-36 py-1 bg-surface border border-rim rounded-lg shadow-xl flex flex-col"
          style={panelStyle()}
        >
          <button
            type="button"
            onClick={() => select("p")}
            class="px-3 py-1.5 text-xs text-txt hover:bg-elevated transition-colors text-left"
          >
            {t("editor.paragraph_label")}
          </button>
          <For each={LEVELS}>
            {(level) => (
              <button
                type="button"
                onClick={() => select(level)}
                class="px-3 py-1.5 text-xs text-txt hover:bg-elevated transition-colors text-left uppercase"
              >
                {level}
              </button>
            )}
          </For>
        </div>
      </Show>
    </>
  );
}
