// Mini profile-style summary of the current page's channel, reusing the
// existing GET /spa/profile/:nick endpoint (same data ChannelView's profile
// header uses) — no widget-specific backend needed.

import { Show, For } from "solid-js";
import { A } from "@solidjs/router";
import { createQueryResource } from "@/shared/lib/createQueryResource";
import { apiFetch } from "@/shared/lib/fetch";
import { usePageNick, useViewerRole } from "@/shared/store/site-config";
import { useI18n } from "@/i18n";
import { MdFillLocation_on, MdFillPublic } from "solid-icons/md";

interface ProfileData {
  channel_name: string;
  channel_address: string;
  xchan_addr: string;
  channel_photo_l: string;
  channel_cover: string;
  pdesc: string;
  location: string;
  homepage: string;
  gender: string;
  marital: string;
  keywords: string[];
  is_connected: boolean;
  connect_url: string;
  is_remote?: boolean;
}

async function fetchProfile(nick: string): Promise<ProfileData | null> {
  if (!nick) return null;
  const res = await apiFetch(`/spa/profile/${nick}`);
  if (!res.ok) return null;
  const json = await res.json();
  return json.data as ProfileData;
}

export default function ContactCardWidget() {
  const nick = usePageNick();
  const viewerRole = useViewerRole();
  const { t } = useI18n();

  const [data] = createQueryResource("contact-card", () => nick(), fetchProfile);

  const profile = () => data();

  return (
    <Show when={!data.loading && profile()}>
      <div class="bg-surface border border-rim rounded-xl overflow-hidden">
        {/* Cover + avatar */}
        <div class="relative bg-gradient-to-br from-accent to-accent-txt" style="aspect-ratio: 3 / 1;">
          <Show when={profile()!.channel_cover}>
            <img src={profile()!.channel_cover} alt="" class="absolute inset-0 w-full h-full object-cover" />
          </Show>
          <div class="absolute -bottom-7 left-4">
            <img
              src={profile()!.channel_photo_l}
              alt={profile()!.channel_name}
              class="w-14 h-14 rounded-full ring-4 ring-surface object-cover bg-overlay"
            />
          </div>
        </div>

        <div class="pt-9 px-4 pb-4">
          <p class="text-sm font-semibold text-txt truncate">{profile()!.channel_name}</p>
          <p class="text-xs text-muted truncate">@{profile()!.xchan_addr || profile()!.channel_address}</p>
          <Show when={profile()!.pdesc}>
            <p class="text-xs text-muted mt-0.5 italic">{profile()!.pdesc}</p>
          </Show>

          <Show when={profile()!.is_remote}>
            <span class="inline-flex items-center gap-1 mt-2 px-2 py-0.5 text-[10px] rounded-full bg-elevated text-muted border border-rim">
              <MdFillPublic size={10} /> {t("channel.remote_channel")}
            </span>
          </Show>

          <Show when={profile()!.location || profile()!.gender || profile()!.marital}>
            <div class="flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted mt-3">
              <Show when={profile()!.location}>
                <span class="flex items-center gap-1">
                  <MdFillLocation_on size={13} /> {profile()!.location}
                </span>
              </Show>
              <Show when={profile()!.gender}>
                <span>{profile()!.gender}</span>
              </Show>
              <Show when={profile()!.marital}>
                <span>{profile()!.marital}</span>
              </Show>
            </div>
          </Show>

          <Show when={profile()!.homepage}>
            <a
              href={profile()!.homepage}
              target="_blank"
              rel="noopener noreferrer"
              class="flex items-center gap-1 text-xs text-accent hover:underline mt-2 truncate"
            >
              <MdFillPublic size={12} />
              {profile()!.homepage.replace(/^https?:\/\//, "")}
            </a>
          </Show>

          <Show when={profile()!.keywords.length > 0}>
            <div class="flex flex-wrap gap-1 mt-3">
              <For each={profile()!.keywords.slice(0, 8)}>
                {(kw) => (
                  <span class="text-[10px] px-1.5 py-0.5 rounded-full bg-elevated text-muted">
                    {kw}
                  </span>
                )}
              </For>
            </div>
          </Show>

          <Show when={viewerRole() !== "owner" && viewerRole() !== "anonymous"}>
            <div class="mt-3 pt-3 border-t border-rim flex gap-3">
              <a href={`/channel/${profile()!.channel_address}`} class="text-xs text-accent hover:underline">
                {t("ui.view_channel")}
              </a>
              <Show when={!profile()!.is_connected && profile()!.connect_url}>
                <a
                  href={profile()!.connect_url}
                  class="text-xs text-accent hover:underline"
                >
                  {t("ui.connect")}
                </a>
              </Show>
            </div>
          </Show>

          <Show when={!profile()!.is_remote}>
            <div class="mt-3 flex justify-end">
              <A
                href={`/profile/${profile()!.channel_address}`}
                class="text-xs text-muted hover:text-accent transition-colors"
              >
                {t("channel.more_details")} →
              </A>
            </div>
          </Show>
        </div>
      </div>
    </Show>
  );
}
