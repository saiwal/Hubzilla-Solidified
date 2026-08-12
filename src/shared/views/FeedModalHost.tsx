import { Show, lazy } from "solid-js";
import { useFeedModal } from "@/shared/store/feed-modal";

const FeedModal = lazy(() => import("./FeedModal"));

export default function FeedModalHost() {
  const [nick, setNick] = useFeedModal();
  const close = () => setNick(null);

  return (
    <Show when={nick()}>
      {(n) => <FeedModal channelNick={n()} onClose={close} />}
    </Show>
  );
}
