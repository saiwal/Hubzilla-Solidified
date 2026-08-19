/**
 * Card authoring templates.
 *
 * A template is a shaping convenience, not a storage format: each one
 * assembles a body out of bbcode core Hubzilla already renders, so a template
 * card stays readable in core's own /cards view and in federated copies. The
 * choice is persisted separately (iconfig cat 'card', k 'template') purely so
 * re-editing reopens the tab that produced the body.
 *
 * composeTemplate and parseTemplate must round-trip: reopening a stored card
 * for editing runs parse, and saving runs compose again, so any asymmetry
 * silently rewrites the user's body.
 */

export type CardTemplate = "freeform" | "quote" | "definition" | "link";

export const CARD_TEMPLATES: CardTemplate[] = ["freeform", "quote", "definition", "link"];

export interface TemplateFields {
  quoteText: string;
  quoteAttribution: string;
  defTerm: string;
  defBody: string;
  linkUrl: string;
  linkTitle: string;
  linkNote: string;
}

export const emptyTemplateFields = (): TemplateFields => ({
  quoteText: "", quoteAttribution: "",
  defTerm: "", defBody: "",
  linkUrl: "", linkTitle: "", linkNote: "",
});

/** Assemble a body from a template's parts. "" means "not complete yet". */
export function composeTemplate(template: CardTemplate, f: TemplateFields): string {
  switch (template) {
    case "quote": {
      const text = f.quoteText.trim();
      if (!text) return "";
      const who = f.quoteAttribution.trim();
      return who ? `[quote=${who}]${text}[/quote]` : `[quote]${text}[/quote]`;
    }
    case "definition": {
      const term = f.defTerm.trim();
      const body = f.defBody.trim();
      if (!term || !body) return "";
      return `[b]${term}[/b]\n${body}`;
    }
    case "link": {
      const url = f.linkUrl.trim();
      if (!url) return "";
      const label = f.linkTitle.trim() || url;
      const note = f.linkNote.trim();
      return `[url=${url}]${label}[/url]${note ? `\n${note}` : ""}`;
    }
    default:
      return "";
  }
}

/** Best-effort guess at which tab produced a stored body. */
export function sniffTemplate(body: string): CardTemplate | null {
  const b = body.trimStart();
  if (/^\[quote[=\]]/i.test(b)) return "quote";
  if (/^\[url=/i.test(b)) return "link";
  if (/^\[b\][^[]*\[\/b\]/i.test(b)) return "definition";
  return null;
}

/** Unpack a stored body back into template sub-form fields. */
export function parseTemplate(body: string): Partial<TemplateFields> {
  const q = body.match(/^\s*\[quote(?:=["']?(.*?)["']?)?\]([\s\S]*?)\[\/quote\]\s*$/i);
  if (q) return { quoteAttribution: q[1]?.trim() ?? "", quoteText: q[2].trim() };

  const l = body.match(/^\s*\[url=(.*?)\]([\s\S]*?)\[\/url\]([\s\S]*)$/i);
  if (l) return { linkUrl: l[1].trim(), linkTitle: l[2].trim(), linkNote: l[3].trim() };

  const d = body.match(/^\s*\[b\]([\s\S]*?)\[\/b\]([\s\S]*)$/i);
  if (d) return { defTerm: d[1].trim(), defBody: d[2].trim() };

  return {};
}
