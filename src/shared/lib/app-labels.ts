// Translates a canonical Hubzilla system-app name (e.g. "Chatrooms",
// "Privacy Groups") into the current locale via the SPA's own `apps` i18n
// namespace — entirely client-side, independent of PHP core's gettext
// catalog, which has no coverage for languages like Hindi.
function slugifyAppName(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

export function appLabel(name: string, t: (key: any) => string): string {
  if (!name) return name;
  const key = `apps.${slugifyAppName(name)}`;
  const translated = t(key as any);
  // t() falls back to returning the key itself when there's no matching
  // entry (custom/personal apps, or a system app not yet in the namespace).
  return translated === key ? name : translated;
}
