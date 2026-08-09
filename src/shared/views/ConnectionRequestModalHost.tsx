import { Show, lazy } from "solid-js";
import { createQueryResource } from "@/shared/lib/createQueryResource";
import { fetchConnectionById } from "@/modules/directory/connections/api";
import { useConnectionRequestModal } from "@/shared/store/connection-request-modal";

const ConnectionEditorModal = lazy(() => import("./ConnectionEditorModal"));

export default function ConnectionRequestModalHost() {
  const [abookId, setAbookId] = useConnectionRequestModal();

  const [connection] = createQueryResource(
    "connection-request-modal",
    () => abookId(),
    (id) => fetchConnectionById(id),
  );

  const close = () => setAbookId(null);

  // Outer Show gates on the id, not the fetched data — createQueryResource
  // keeps previous-key data visible as a placeholder, so gating on
  // connection() alone would never let the modal close.
  return (
    <Show when={abookId() !== null}>
      <Show when={connection()}>
        {(conn) => (
          <ConnectionEditorModal
            connection={conn()}
            authorName={conn().name}
            authorAvatar={conn().photo}
            onSaved={close}
            onClose={close}
            onDeleted={close}
          />
        )}
      </Show>
    </Show>
  );
}
