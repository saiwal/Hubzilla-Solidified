import { A, useLocation } from "@solidjs/router";
import type { Component, JSX } from "solid-js";
import { Show } from "solid-js";

/*
 * Minimal starter — solidified's NavItem.tsx maps ~30 icon tokens
 * (ModuleDef.navItem.icon / WidgetDef icons) to solid-icons components and
 * adds drag-to-reorder support (useLayoutChrome()'s desktopNavDrag/
 * bottomTabDrag/moreDrawerDrag already track order regardless of whether you
 * wire a drag handle here — see solidified's version for the full pattern).
 * This version falls back to a generic dot for every icon token; build out
 * your own ICON_MAP as you add modules.
 */
function GenericIcon(props: { size: number }) {
  return (
    <svg width={props.size} height={props.size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <circle cx="12" cy="12" r="5" />
    </svg>
  );
}

export function getNavIcon(_token?: string, size = 20): JSX.Element {
  return <GenericIcon size={size} />;
}

interface Props {
  href: string | (() => string);
  label: string | (() => string);
  icon?: string;
}

const NavItem: Component<Props> = (props) => {
  const href = () => (typeof props.href === "function" ? props.href() : props.href);
  const label = () => (typeof props.label === "function" ? props.label() : props.label);

  // Absolute URLs (http/https) must do a hard navigation so the target
  // domain serves its own theme rather than the SPA intercepting the route.
  const isAbsolute = () => /^https?:\/\//.test(href());
  const location = useLocation();
  const isCurrentPage = () => {
    if (isAbsolute()) return false;
    const h = href();
    if (h === "/") return location.pathname === "/";
    return location.pathname.startsWith(h.split("/:")[0].split("?")[0]);
  };

  const content = () => (
    <>
      <span aria-hidden="true" class="shrink-0 w-5 h-5 flex items-center justify-center">
        {getNavIcon(props.icon, 20)}
      </span>
      <span class="truncate">{label()}</span>
    </>
  );

  return (
    <Show
      when={isAbsolute()}
      fallback={
        <A
          href={href()}
          end={href() === "/"}
          class="flex items-center gap-3 rounded-lg px-2.5 py-2 text-sm"
          activeClass="font-medium"
          aria-current={isCurrentPage() ? "page" : undefined}
        >
          {content()}
        </A>
      }
    >
      <a
        href={href()}
        class="flex items-center gap-3 rounded-lg px-2.5 py-2 text-sm"
        onClick={(e) => {
          e.preventDefault();
          window.location.replace(href());
        }}
      >
        {content()}
      </a>
    </Show>
  );
};

export default NavItem;
