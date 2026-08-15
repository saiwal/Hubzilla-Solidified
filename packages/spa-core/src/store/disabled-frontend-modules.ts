// shared/store/disabled-frontend-modules.ts
//
// Persists the set of user-disabled `frontendFeature` modules (e.g. tools,
// games — pure-frontend modules with no backing Hubzilla app) to pconfig
// (cat "spa", key "disabled_frontend_modules"), with a localStorage cache so
// gating doesn't flash the enabled state before pconfig loads. Toggled from
// the Integrations settings section.

import { createSignal } from "solid-js";
import { apiFetch } from "../lib/fetch";

const STORAGE_KEY = "hz-disabled-frontend-modules";

function parseIds(raw: unknown): string[] {
  if (typeof raw === "string") {
    if (!raw.trim()) return [];
    try {
      raw = JSON.parse(raw);
    } catch {
      return [];
    }
  }
  return Array.isArray(raw) ? raw.filter((x): x is string => typeof x === "string") : [];
}

function readCache(): Set<string> {
  try {
    return new Set(parseIds(localStorage.getItem(STORAGE_KEY)));
  } catch {
    return new Set();
  }
}

function writeCache(ids: string[]): void {
  try {
    if (ids.length) localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
    else localStorage.removeItem(STORAGE_KEY);
  } catch {
    // storage full / private mode — cache is best-effort
  }
}

const [disabledFrontendModules, setDisabledFrontendModules] = createSignal<Set<string>>(readCache());
export { disabledFrontendModules };

// Called from auth-store with the pconfig value at boot — the server wins,
// including its absence (a reset on another device must clear this cache too).
export function initDisabledFrontendModules(raw: string | undefined): void {
  const parsed = raw !== undefined ? parseIds(raw) : [];
  setDisabledFrontendModules(new Set(parsed));
  writeCache(parsed);
}

export function setFrontendModuleEnabled(id: string, enabled: boolean): void {
  const next = new Set(disabledFrontendModules());
  if (enabled) next.delete(id);
  else next.add(id);
  setDisabledFrontendModules(next);
  writeCache([...next]);
  apiFetch("/spa/settings/integrations", {
    method: "POST",
    body: JSON.stringify({ action: "toggle-frontend", id, enabled }),
  }).catch(() => {});
}
