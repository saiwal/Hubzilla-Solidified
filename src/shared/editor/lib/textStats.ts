/** Shared word-count logic for the composer word/char counters. */
export function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}
