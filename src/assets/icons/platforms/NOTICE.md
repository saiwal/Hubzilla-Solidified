Third-party brand icons used to identify a post author's fediverse platform.

- `mastodon.svg`, `diaspora.svg`, `pixelfed.svg`, `misskey.svg`, `peertube.svg`,
  `pleroma.svg`, `lemmy.svg`, `wordpress.svg`, `nodebb.svg`, `ghost.svg`,
  `firefish.svg`, `forgejo.svg`, `activitypub.svg`, `rss.svg` — from the
  [Simple Icons](https://simpleicons.org/) project, CC0 1.0 Universal. (Simple
  Icons also has entries titled "Loops" and "Plume", but those are unrelated
  brands — an email tool and a mesh-WiFi company — not the fediverse software
  of the same name, so those two were deliberately skipped in favor of a
  monogram.)
- `friendica.svg` — Friendica's own official logo asset
  (friendica/friendica `images/friendica.svg`).
- `piefed.svg` — PieFed's own official logo asset
  (codeberg.org/rimu/pyfedi `app/static/images/piefed_logo_icon_t_256x256.svg`).
- `hubzilla.svg` — this theme's own Hubzilla icon (copy of `/public/hubzilla.svg`).

Everything else in fedidb.com/software's top 50 by user count (Streams, Forte,
WriteFreely, Akkoma, GoToSocial, Mobilizon, Bookwyrm, Sharkey, Loops, Plume,
and more) has no confidently-sourced official standalone logo asset, so it
renders the letter-monogram fallback in `PlatformIcons.tsx`'s
`PLATFORM_MONOGRAMS` map instead.
