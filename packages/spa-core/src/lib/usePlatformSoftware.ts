// Looks up the fediverse software (Mastodon, Friendica, Hubzilla…) an author's
// instance reports via nodeinfo, through the server-cached /spa/nodeinfo endpoint.

import { createQueryResource } from "./createQueryResource";
import { apiFetch } from "./fetch";

async function fetchSoftware(url: string): Promise<string | null> {
  const res = await apiFetch(`/spa/nodeinfo?url=${encodeURIComponent(url)}`);
  if (!res.ok) return null;
  const { data } = await res.json();
  return data?.software ?? null;
}

export function usePlatformSoftware(url: () => string | undefined | null) {
  const [software] = createQueryResource(
    "nodeinfo",
    () => url() || false,
    fetchSoftware,
  );
  return software;
}
