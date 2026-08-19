import { apiFetch, apiError } from "@utsukta/spa-core/lib/fetch";
import { getCsrfToken } from "@utsukta/spa-core/lib/csrf";

// ── Types ────────────────────────────────────────────────────────────────────

export interface Addressbook {
  id: number;
  uri: string;
  displayname: string;
  /** Sabre's VCFExportPlugin endpoint — a plain link, not a fetch. */
  exportUrl: string;
}

/** A TEL / EMAIL / IMPP / URL entry. `type` is the raw vCard TYPE. */
export interface TypedValue {
  type: string;
  label: string;
  value: string;
}

/** An ADR entry. `parts` is the 7 vCard components, in order. */
export interface TypedAddress {
  type: string;
  label: string;
  parts: string[];
}

export interface Card {
  id: number;
  uri: string;
  photo: string;
  fn: string;
  org: string;
  title: string;
  note: string;
  tels: TypedValue[];
  emails: TypedValue[];
  impps: TypedValue[];
  urls: TypedValue[];
  adrs: TypedAddress[];
}

export interface CardsResponse {
  addressbook: Addressbook;
  cards: Card[];
}

/** The write shape — mirrors the field names process_cdav_card() expects. */
export interface CardInput {
  fn: string;
  org: string;
  title: string;
  note: string;
  tel: string[];
  tel_type: string[];
  email: string[];
  email_type: string[];
  impp: string[];
  impp_type: string[];
  url: string[];
  url_type: string[];
  adr: string[][];
  adr_type: string[];
}

// ── Helpers ──────────────────────────────────────────────────────────────────

async function get<T>(path: string): Promise<T> {
  const res = await apiFetch(path);
  if (!res.ok) throw await apiError(res);
  return (await res.json()).data as T;
}

async function post<T>(path: string, body?: unknown): Promise<T> {
  const res = await apiFetch(path, {
    method: "POST",
    body: JSON.stringify(body ?? {}),
  });
  if (!res.ok) throw await apiError(res);
  return (await res.json()).data as T;
}

// ── Address books ────────────────────────────────────────────────────────────

export const fetchAddressbooks = () => get<Addressbook[]>("/spa/addressbook");

export const fetchCards = (id: number) => get<CardsResponse>(`/spa/addressbook/${id}`);

export const createAddressbook = (name: string) =>
  post<Addressbook>("/spa/addressbook/create", { name });

export const renameAddressbook = (id: number, name: string) =>
  post<Addressbook>(`/spa/addressbook/${id}/edit`, { name });

export const deleteAddressbook = (id: number) =>
  post<{ deleted: boolean }>(`/spa/addressbook/${id}/delete`);

// ── Cards ────────────────────────────────────────────────────────────────────

export const createCard = (bookId: number, input: CardInput) =>
  post<{ uri: string }>(`/spa/addressbook/${bookId}/card/create`, input);

export const updateCard = (bookId: number, uri: string, input: CardInput) =>
  post<{ uri: string }>(`/spa/addressbook/${bookId}/card/update`, { ...input, uri });

export const deleteCard = (bookId: number, uri: string) =>
  post<{ deleted: boolean }>(`/spa/addressbook/${bookId}/card/delete`, { uri });

// ── Import ───────────────────────────────────────────────────────────────────

/**
 * Post the .vcf straight at core's own /cdav/addressbook endpoint, which runs
 * Sabre's VCard splitter, converts each object to VCARD40, validates/repairs it
 * and emits its own Libsync packet. Duplicating that here would buy nothing.
 * Multipart, so this can't go through apiFetch (which forces a JSON content type).
 */
export async function importVcf(bookId: number, file: File): Promise<void> {
  const fd = new FormData();
  fd.append("userfile", file);
  fd.append("target", String(bookId));
  fd.append("a_upload", "a_upload");

  const res = await fetch("/cdav/addressbook", {
    method: "POST",
    credentials: "include",
    headers: { "X-CSRF-Token": await getCsrfToken() },
    body: fd,
  });

  if (!res.ok) throw new Error(`HTTP ${res.status}`);
}
