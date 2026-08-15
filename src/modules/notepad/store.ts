import { createSignal } from "solid-js";
import { fetchNotes, deleteNote, type Note, type NoteFilters } from "./api";
import { toast } from "@utsukta/spa-core/store/toast";

const PAGE_SIZE = 20;

const [notes, setNotes]     = createSignal<Note[]>([]);
const [loading, setLoading] = createSignal(false);
const [hasMore, setHasMore] = createSignal(false);
const [offset, setOffset]   = createSignal(0);
const [filters, setFilters] = createSignal<NoteFilters>({});

export { notes, loading, hasMore, filters };

export async function loadNotes(reset = false, nextFilters?: NoteFilters) {
  if (nextFilters !== undefined) setFilters(nextFilters);
  if (reset) {
    setOffset(0);
    setNotes([]);
  }
  setLoading(true);
  try {
    const res = await fetchNotes(reset ? 0 : offset(), PAGE_SIZE, filters());
    const items = res.data ?? [];
    setNotes(reset ? items : [...notes(), ...items]);
    setHasMore(res.meta?.has_more ?? false);
    setOffset((reset ? 0 : offset()) + items.length);
  } catch (e: any) {
    toast.error(e.message ?? "Failed to load notes");
  } finally {
    setLoading(false);
  }
}

export async function removeNote(note: { mid: string; uuid: string }) {
  const prev = notes();
  setNotes(prev.filter((n) => n.mid !== note.mid));
  try {
    await deleteNote(note.uuid);
  } catch (e: any) {
    setNotes(prev);
    toast.error(e.message ?? "Delete failed");
  }
}
