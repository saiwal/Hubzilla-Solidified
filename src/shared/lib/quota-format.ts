// Shared formatting helpers for account service-class quotas (AccountQuota[]
// from GET /spa/settings/account). Used by the full quota list on the Account
// settings page and by the condensed hq.usage_quotas widget.

import type { AccountQuota, QuotaKey } from "@/modules/settings/store/types";

const BYTE_KEYS: readonly QuotaKey[] = ["photo_upload_limit", "attach_upload_limit"];

export function humanBytes(n: number): string {
  if (n >= 1073741824) return `${(n / 1073741824).toFixed(1)} GB`;
  if (n >= 1048576) return `${(n / 1048576).toFixed(1)} MB`;
  if (n >= 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${n} B`;
}

export function formatQuotaValue(key: QuotaKey, n: number): string {
  return BYTE_KEYS.includes(key) ? humanBytes(n) : String(n);
}

export function quotaPercent(quota: AccountQuota): number | null {
  const { usage, limit } = quota;
  if (usage === null || !limit) return null;
  return Math.min(100, Math.round((usage / limit) * 100));
}
