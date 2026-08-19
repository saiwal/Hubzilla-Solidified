// Card URL helpers — slug-preferred, falling back to the raw item uuid
// when no slug has been set.

export interface CardLinkable {
  uuid: string;
  slug?: string;
}

/** Client route path for viewing a card: /cards/:nick/:slugOrUuid */
export function cardPath(nick: string, card: CardLinkable): string {
  return `/cards/${nick}/${card.slug || card.uuid}`;
}

/** Absolute, publicly-resolvable URL for a card (slug-preferred). */
export function cardShareUrl(
  nick: string,
  card: CardLinkable & { viewUrl?: string },
): string {
  return card.viewUrl || `${window.location.origin}${cardPath(nick, card)}`;
}

// Plain-text excerpt from rendered (HTML) body — used only as a fallback
// when the card has no explicit summary.
function excerptFromBody(body: string, maxLen = 200): string {
  const plain = body.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
  if (!plain) return "";
  return plain.length <= maxLen ? plain : plain.slice(0, maxLen).replace(/\s+\S*$/, "") + "…";
}

export function buildCardShareBody(
  nick: string,
  card: CardLinkable & { title: string; summary?: string; body?: string; viewUrl?: string },
): string {
  const link  = cardShareUrl(nick, card);
  const title = card.title?.trim() || link;
  let body = `[url=${link}]${title}[/url]`;
  const quoteText = card.summary?.trim() || excerptFromBody(card.body ?? "");
  if (quoteText) body += `\n\n[quote]${quoteText}[/quote]`;
  return body;
}

/** BBCode token that embeds this card into any post or comment. */
export function cardEmbedCode(iid: number): string {
  return `[card=${iid}][/card]`;
}
