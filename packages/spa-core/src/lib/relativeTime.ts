import type { useI18n } from "../i18n";

/**
 * Enotify::format() (Zotlabs/Lib/Enotify.php) converts `created` from UTC to
 * the server's configured local timezone before sending it as `when` — so it
 * must be parsed as local time here, not UTC (no "Z" suffix).
 * Exception: Enotify::format_all_events() sends `when` as an already
 * human-formatted string ("8 AM Friday January 18 [today]"), not a
 * parseable datetime — pass those through as-is instead of "NaNd ago".
 */
export function relativeTime(when: string | undefined, t: ReturnType<typeof useI18n>["t"]): string {
  if (!when) return "";
  const d = new Date(when.replace(" ", "T"));
  if (isNaN(d.getTime())) return when;
  const diff = Math.max(0, Math.floor((Date.now() - d.getTime()) / 1000));
  if (diff < 60) return t("notify.time_just_now");
  if (diff < 3600) return t("notify.time_minutes_ago", { n: String(Math.floor(diff / 60)) });
  if (diff < 86400) return t("notify.time_hours_ago", { n: String(Math.floor(diff / 3600)) });
  return t("notify.time_days_ago", { n: String(Math.floor(diff / 86400)) });
}
