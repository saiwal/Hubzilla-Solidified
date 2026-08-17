/**
 * CategoryChips.tsx
 * Read-only category chips for an event. Chip styling matches the editable chips in
 * CategoryTagsField so an event looks the same in the detail panel and the composer.
 *
 * Channel-calendar events only in practice — CalDAV events have no companion item and
 * always come back with an empty list.
 */

import { For, Show, type Component } from "solid-js";

const CategoryChips: Component<{ categories?: string[] }> = (props) => (
  <Show when={props.categories?.length}>
    <div class="flex flex-wrap items-center gap-1">
      <For each={props.categories}>
        {(cat) => (
          <span class="px-1.5 py-0.5 rounded bg-elevated text-xs text-txt">{cat}</span>
        )}
      </For>
    </div>
  </Show>
);

export default CategoryChips;
