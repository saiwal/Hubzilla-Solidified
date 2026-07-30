// Curated list of ISO-639-1 codes for the article language picker. Deliberately
// broader than the app's own UI locales (src/i18n/locales) — content can be
// written in any language regardless of which languages the interface itself
// has been translated into.
export const LANGUAGE_CODES = [
  "en", "es", "pt", "fr", "de", "it", "nl", "pl", "ro", "el",
  "ru", "uk", "cs", "sk", "hu", "bg", "sr", "hr", "sl", "sv",
  "da", "nb", "fi", "et", "lv", "lt", "tr", "ar", "he", "fa",
  "hi", "bn", "ur", "th", "vi", "id", "ms", "zh", "ja", "ko",
  "sw", "am", "ka", "hy", "sq", "eu", "ca", "gl", "is", "ga",
] as const;

export type LanguageCode = (typeof LANGUAGE_CODES)[number];

/** Localized display name for a language code, e.g. "French" / "Français". */
export function languageLabel(code: string, displayLocale?: string): string {
  if (!code) return "";
  try {
    const dn = new Intl.DisplayNames([displayLocale ?? navigator.language], { type: "language" });
    return dn.of(code) ?? code;
  } catch {
    return code;
  }
}
