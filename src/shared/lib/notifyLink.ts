function toPath(href: string): string {
  try {
    if (href.startsWith("http")) {
      const u = new URL(href);
      return u.pathname + u.search + u.hash;
    }
  } catch {
    /* fall through */
  }
  return href;
}

// Classic Hubzilla's "intro" (new connection request) notifications link to
// connections#<abook_id> — the classic connections page, which the SPA
// doesn't route.
const INTRO_LINK_RE = /^\/connections#(\d+)$/;

// abook_id if this notify_link is a connection-request intro, else null —
// callers use this to open the accept/reject modal in place instead of
// navigating anywhere.
export function connectionRequestId(href?: string): number | null {
  if (!href) return null;
  const m = toPath(href).match(INTRO_LINK_RE);
  return m ? Number(m[1]) : null;
}

// Converts a `notify_link` from classic Hubzilla notifications into the path
// the SPA should navigate to. Handles absolute-URL → relative-path reduction,
// plus remapping classic routes that have no SPA equivalent onto the SPA
// route that covers the same feature. Used as the <a href> fallback (new-tab,
// no-JS) — callers that can act on `connectionRequestId` first should prefer
// opening the modal in place over navigating here.
export function resolveNotifyPath(href?: string): string {
  if (!href) return "#";
  const path = toPath(href);
  const introMatch = path.match(INTRO_LINK_RE);
  if (introMatch) return `/directory/connections?open=${introMatch[1]}`;
  return path;
}
