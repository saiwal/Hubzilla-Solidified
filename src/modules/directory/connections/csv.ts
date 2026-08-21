// Hand-rolled parser for a "list of followed accounts" CSV (e.g. Mastodon's
// following_accounts.csv export: header "Account address", one addr per row).
// No quoting/escaping support — the described format is a single column of
// unquoted user@host values; add a real CSV lib if a richer export shows up.
export function parseFollowingCsv(text: string): string[] {
  const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length === 0) return [];

  const header = lines[0].split(",").map((c) => c.trim().toLowerCase());
  let col = header.findIndex((c) => c.includes("address") || c.includes("account"));
  const hasHeader = col !== -1;
  if (col === -1) col = 0;

  const rows = hasHeader ? lines.slice(1) : lines;
  const addresses = new Set<string>();
  for (const line of rows) {
    const value = line.split(",")[col]?.trim();
    if (value && value.includes("@")) addresses.add(value);
  }
  return [...addresses];
}
