// Fediverse-platform badges next to a post author, keyed by nodeinfo's
// lowercased software.name. Real brand icons (see
// src/assets/icons/platforms/NOTICE.md for sources/licensing). Streams/Forte
// have no available standalone logo asset, so they keep the old
// letter-monogram treatment.

import { Show, type JSX } from "solid-js";
import { MdOutlineHelp_outline } from "solid-icons/md";
import { usePlatformSoftware } from "@utsukta/spa-core/lib/usePlatformSoftware";
import mastodonIcon from "@/assets/icons/platforms/mastodon.svg";
import friendicaIcon from "@/assets/icons/platforms/friendica.svg";
import hubzillaIcon from "@/assets/icons/platforms/hubzilla.svg";
import diasporaIcon from "@/assets/icons/platforms/diaspora.svg";
import pleromaIcon from "@/assets/icons/platforms/pleroma.svg";
import pixelfedIcon from "@/assets/icons/platforms/pixelfed.svg";
import misskeyIcon from "@/assets/icons/platforms/misskey.svg";
import peertubeIcon from "@/assets/icons/platforms/peertube.svg";
import activitypubIcon from "@/assets/icons/platforms/activitypub.svg";
import rssIcon from "@/assets/icons/platforms/rss.svg";

const PLATFORM_ICON_SRC: Record<string, string> = {
  mastodon: mastodonIcon,
  friendica: friendicaIcon,
  hubzilla: hubzillaIcon,
  diaspora: diasporaIcon,
  pleroma: pleromaIcon,
  pixelfed: pixelfedIcon,
  misskey: misskeyIcon,
  peertube: peertubeIcon,
};

interface Monogram {
  letter: string;
  cls: string;
}

// No standalone logo asset available for these — fall back to a monogram.
const PLATFORM_MONOGRAMS: Record<string, Monogram> = {
  streams: { letter: "S", cls: "bg-violet-500 text-white" },
  forte: { letter: "Fo", cls: "bg-violet-500 text-white" },
};

export interface NetworkBadge {
  label: string;
  cls: string;
  icon: string;
}

// Coarse fallback for when nodeinfo has no answer (unreachable host, or
// software — like Hubzilla itself — that doesn't expose nodeinfo at all).
export function networkBadge(network?: string): NetworkBadge | null {
  if (!network) return null;
  switch (network.toLowerCase()) {
    case "zot6":        return { label: "Hubzilla",    cls: "bg-violet-500/20 text-violet-400", icon: hubzillaIcon };
    case "activitypub": return { label: "ActivityPub", cls: "bg-indigo-500/20 text-indigo-400", icon: activitypubIcon };
    case "rss":          return { label: "RSS",         cls: "bg-orange-500/20 text-orange-400", icon: rssIcon };
    case "diaspora":     return { label: "Diaspora",    cls: "bg-emerald-500/20 text-emerald-400", icon: diasporaIcon };
    default:             return null;
  }
}

function IconChip(props: { src: string; alt: string; size: number }): JSX.Element {
  return (
    <img
      src={props.src}
      alt={props.alt}
      title={props.alt}
      width={props.size}
      height={props.size}
      class="shrink-0 object-contain"
      style={{ width: `${props.size}px`, height: `${props.size}px` }}
    />
  );
}

function Monogram(props: { letter: string; cls: string; size: number; title: string }): JSX.Element {
  return (
    <span
      class={`inline-flex items-center justify-center rounded-full font-bold leading-none shrink-0 ${props.cls}`}
      style={{
        width: `${props.size}px`,
        height: `${props.size}px`,
        "font-size": `${Math.max(6, props.size * 0.5)}px`,
      }}
      title={props.title}
    >
      {props.letter}
    </span>
  );
}

export function platformLabel(software: string): string {
  return software.length <= 3 ? software.toUpperCase() : software[0].toUpperCase() + software.slice(1);
}

export function PlatformIcon(props: { url?: string; network?: string; size?: number }): JSX.Element {
  const software = usePlatformSoftware(() => props.url);
  const name = () => software()?.toLowerCase();
  const iconSrc = () => {
    const n = name();
    return n ? PLATFORM_ICON_SRC[n] : undefined;
  };
  const monogram = () => {
    const n = name();
    return n ? PLATFORM_MONOGRAMS[n] : undefined;
  };
  // No nodeinfo answer at all (unreachable host, or software — like Hubzilla
  // itself — that doesn't expose nodeinfo) falls back to the coarse
  // network badge instead of a misleading "unknown platform" mark.
  const netBadge = () => networkBadge(props.network);

  return (
    <Show
      when={iconSrc()}
      fallback={
        <Show
          when={monogram()}
          fallback={
            <Show
              when={netBadge()}
              fallback={
                <Show when={name()}>
                  <MdOutlineHelp_outline size={props.size ?? 12} class="text-muted shrink-0" title="Unknown fediverse platform" />
                </Show>
              }
            >
              {(b) => <IconChip src={b().icon} alt={b().label} size={props.size ?? 12} />}
            </Show>
          }
        >
          {(m) => <Monogram letter={m().letter} cls={m().cls} size={props.size ?? 12} title={platformLabel(software()!)} />}
        </Show>
      }
    >
      {(src) => <IconChip src={src()} alt={platformLabel(software()!)} size={props.size ?? 12} />}
    </Show>
  );
}
