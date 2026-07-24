import { createSignal, onCleanup, onMount } from "solid-js";

/** Distributes items round-robin across n columns (item i -> column i % n).
 * Because the source order is preserved within each column, this reads
 * left-to-right, top-to-bottom across columns of uneven height, without a
 * height-measuring packing pass. */
export function splitIntoColumns<T>(items: T[], n: number): T[][] {
  const cols: T[][] = Array.from({ length: n }, () => []);
  items.forEach((item, i) => cols[i % n]!.push(item));
  return cols;
}

interface ColumnBreakpoint {
  width: number;
  count: number;
}

/** Reactive column count derived from viewport width via ResizeObserver.
 * `breakpoints` must be sorted widest-first; `base` applies below the
 * narrowest one. */
export function useColumnCount(breakpoints: ColumnBreakpoint[], base: number): () => number {
  const getCount = () => {
    const w = window.innerWidth;
    for (const bp of breakpoints) {
      if (w >= bp.width) return bp.count;
    }
    return base;
  };
  const [count, setCount] = createSignal(getCount());
  onMount(() => {
    const obs = new ResizeObserver(() => setCount(getCount()));
    obs.observe(document.documentElement);
    onCleanup(() => obs.disconnect());
  });
  return count;
}
