import DOMPurify from "dompurify";
import { bbcodeToHtml } from "./bbcode";

// Renders bbcode/html/markdown item body to sanitized HTML for inline display.
// Shared by PageView.tsx (webpages) and HtmlBlockWidget.tsx (block presets) —
// both display a Hubzilla item's body+mimetype the same way.
export function renderBody(body: string, mimetype: string): string {
  switch (mimetype) {
    case "text/bbcode":
      return DOMPurify.sanitize(bbcodeToHtml(body));
    case "text/html":
      return DOMPurify.sanitize(body);
    case "text/markdown":
      // Markdown: treat as plain text wrapped in <pre> until a Markdown lib is added
      return `<pre class="whitespace-pre-wrap">${DOMPurify.sanitize(body)}</pre>`;
    default:
      return DOMPurify.sanitize(body);
  }
}
