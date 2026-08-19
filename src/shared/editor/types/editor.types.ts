export type EditorTab = "wysiwyg" | "source";
export type MimeType = "text/bbcode" | "text/html" | "text/markdown";

export type ToolbarLevel = "full" | "minimal" | "comment";
export type AttachmentsMode = "none" | "files" | "photos" | "both";
// How the LaTeX toolbar button inserts an equation:
// - "image": render to PNG, upload as a photo, insert a hosted [img] URL —
//   for federated content, where a raw data: URI/inline SVG is unreliable.
// - "live": insert $…$ / $$…$$ text, rendered client-side by hydrateLatex()
//   wherever the content is actually viewed — for in-app-only content.
export type LatexInsertMode = "image" | "live";

export type EditorCapabilities = {
  toolbar: ToolbarLevel;
  title: boolean;
  summary: boolean;
  slug: boolean;
  category: boolean;
  attachments: AttachmentsMode;
  aclPicker: boolean;
  submitOnCtrlEnter: boolean;
  latexMode: LatexInsertMode;
  poll: boolean;
  // Whether the toolbar offers "Insert card" — true wherever a [card=<id>]
  // token is meaningful, i.e. content whose body Item.php/Cards.php expand at
  // save time. Off elsewhere so the button can't insert a token that would be
  // stored raw.
  cardPicker: boolean;
};

export type ComposerMeta = {
  title?: string;
  summary?: string;
  slug?: string;
  category?: string;
  mimetype?: MimeType;
};

export const CAPABILITIES: Record<string, EditorCapabilities> = {
  // Wall post (HQ / network composer)
  post: {
    toolbar: "full",
    title: true,
    summary: true,
    slug: false,
    category: true,
    attachments: "both",
    aclPicker: true,
    submitOnCtrlEnter: true,
    latexMode: "image",
    poll: true,
    cardPicker: true,
  },
  // Inline comment box under a PostCard — same full toolbar as the post
  // composer, only the meta fields (title/summary/ACL/…) are stripped.
  comment: {
    toolbar: "full",
    title: false,
    summary: false,
    slug: false,
    category: false,
    attachments: "none",
    aclPicker: false,
    submitOnCtrlEnter: true,
    latexMode: "image",
    poll: false,
    cardPicker: true,
  },
  // Direct message — same full toolbar as post, but recipients are picked
  // via a "To:" field (RecipientField) instead of the ACL picker, so
  // aclPicker stays false here even though it does gate visibility/scope.
  dm: {
    toolbar: "full",
    title: false,
    summary: false,
    slug: false,
    category: false,
    attachments: "both",
    aclPicker: false,
    submitOnCtrlEnter: true,
    latexMode: "image",
    poll: false,
    cardPicker: false,
  },
  // Article / long-form post — read in-app like webpages/wiki, not federated
  // as a standalone object in the same way a stream post is, so LaTeX
  // renders live (KaTeX) rather than as an uploaded image.
  article: {
    toolbar: "full",
    title: true,
    summary: true,
    slug: true,
    category: true,
    attachments: "both",
    aclPicker: true,
    submitOnCtrlEnter: false,
    latexMode: "live",
    poll: false,
    cardPicker: true,
  },
  // Card — short-form, item-backed content read in-app like articles, so
  // LaTeX renders live (KaTeX). A card body may itself embed another card:
  // Cards.php expands the token at save time exactly as Item.php does.
  card: {
    toolbar: "full",
    title: true,
    summary: true,
    slug: true,
    category: true,
    attachments: "both",
    aclPicker: true,
    submitOnCtrlEnter: false,
    latexMode: "live",
    poll: false,
    cardPicker: true,
  },
  // Hubzilla webpage (static page with slug) — read in-app, not federated as
  // a standalone object, so LaTeX renders live (KaTeX) rather than as an image.
  webpage: {
    toolbar: "full",
    title: true,
    summary: true,
    slug: true,
    category: false,
    attachments: "files",
    aclPicker: true,
    submitOnCtrlEnter: false,
    latexMode: "live",
    poll: false,
    cardPicker: false,
  },
  // Hubzilla block (item-backed content preset, referenced by name rather
  // than URL slug — see core's Comanche [block]name[/block]) — read in-app
  // like webpages, so LaTeX renders live (KaTeX) rather than as an image.
  block: {
    toolbar: "full",
    title: true,
    summary: false,
    slug: true,
    category: false,
    attachments: "files",
    aclPicker: true,
    submitOnCtrlEnter: false,
    latexMode: "live",
    poll: false,
    cardPicker: false,
  },
  // Wiki page — full toolbar (uniform with the other composers), no ACL,
  // no attachments; live LaTeX, same reasoning as webpage above.
  wiki: {
    toolbar: "full",
    title: false,
    summary: false,
    slug: false,
    category: false,
    attachments: "none",
    aclPicker: false,
    submitOnCtrlEnter: false,
    latexMode: "live",
    poll: false,
    cardPicker: false,
  },
  // Personal note — always private, full toolbar (uniform with the other
  // composers); read in-app only, so LaTeX renders live (KaTeX) rather than
  // as an uploaded image.
  note: {
    toolbar: "full",
    title: false,
    summary: false,
    slug: false,
    category: false,
    attachments: "both",
    aclPicker: false,
    submitOnCtrlEnter: true,
    latexMode: "live",
    poll: false,
    cardPicker: false,
  },
  // Chat room message input — comment toolbar, untabbed, Ctrl+Enter sends
  chat: {
    toolbar: "comment",
    title: false,
    summary: false,
    slug: false,
    category: false,
    attachments: "none",
    aclPicker: false,
    submitOnCtrlEnter: true,
    latexMode: "image",
    poll: false,
    cardPicker: false,
  },
};
