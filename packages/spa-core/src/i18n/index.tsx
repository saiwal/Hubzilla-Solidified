import { createContext, useContext, createMemo, createSignal, createResource, createEffect } from "solid-js";
import type { ParentComponent } from "solid-js";
import * as i18n from "@solid-primitives/i18n";
import { dict as enDict } from "./locales/en/index";
import { localeRegistry } from "./locales/index";
import type { Locale, RawDictionary } from "./locales/index";

export type { Locale };

export const LOCALES = (
  Object.entries(localeRegistry) as [Locale, { label: string; flag: string }][]
).map(([value, { label, flag }]) => ({ value, label, flag }));

type Dictionary = i18n.Flatten<RawDictionary>;

type I18nCtx = {
  t: i18n.Translator<Dictionary>;
  locale: () => Locale;
  setLocale: (l: Locale) => void;
};

const I18nContext = createContext<I18nCtx>();
const FALLBACK: Locale = "en";
const LOCALE_STORAGE_KEY = "hz-locale";

function getInitialLocale(): Locale {
  try {
    const saved = localStorage.getItem(LOCALE_STORAGE_KEY);
    if (saved && saved in localeRegistry) return saved as Locale;
  } catch {}
  return FALLBACK;
}

/** True once a locale has been explicitly set (manually, or synced from classic Hubzilla). */
export function hasStoredLocalePreference(): boolean {
  try {
    return localStorage.getItem(LOCALE_STORAGE_KEY) !== null;
  } catch {
    return false;
  }
}

/**
 * Maps a classic-Hubzilla language code (from App::$language — e.g. "de",
 * "pt-br") to one of the SPA's implemented locales, falling back to English
 * when there's no match (e.g. a language classic supports via core gettext
 * but the SPA hasn't added an `apps`/i18n namespace for yet).
 */
export function resolveSupportedLocale(code: string | null | undefined): Locale {
  if (!code) return FALLBACK;
  const lc = code.toLowerCase();
  if (lc in localeRegistry) return lc as Locale;
  const base = lc.split(/[-_]/)[0];
  if (base in localeRegistry) return base as Locale;
  return FALLBACK;
}

export const I18nProvider: ParentComponent = (props) => {
  const [locale, setLocaleSignal] = createSignal<Locale>(getInitialLocale());

  // EN is statically imported above (main bundle). Other locales load lazily.
  // initialValue seeds the resource so the first render is never empty.
  const [rawDict] = createResource(
    locale,
    (loc) => localeRegistry[loc].load(),
    { initialValue: enDict },
  );

  // .latest keeps the previous locale visible while the next one loads —
  // avoids a flash of raw keys on locale switch.
  const dict = createMemo((): Dictionary => i18n.flatten(rawDict.latest ?? enDict));

  const rawT = i18n.translator(dict, i18n.resolveTemplate);

  const t = (key: any, ...args: any[]) => {
    try {
      const result = rawT(key, ...args);
      return result ?? (key as string);
    } catch {
      console.warn(`[i18n] missing key: ${String(key)}`);
      return key as string;
    }
  };

  createEffect(() => {
    document.documentElement.lang = locale();
  });

  const setLocale = (l: Locale) => {
    try {
      localStorage.setItem(LOCALE_STORAGE_KEY, l);
    } catch {}
    setLocaleSignal(l);
  };

  return (
    <I18nContext.Provider value={{ t, locale, setLocale }}>
      {props.children}
    </I18nContext.Provider>
  );
};

export const useI18n = () => {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
};
