/** Longest error text we ever surface — server messages can carry a PHP stack trace. */
export const ERROR_MAX_LEN = 200;

export function truncateError(msg: string): string {
  return msg.length > ERROR_MAX_LEN ? msg.slice(0, ERROR_MAX_LEN - 1).trimEnd() + '…' : msg;
}

/**
 * Error for a failed response, preferring the server's `{ error: { message } }`
 * text over the bare status code. `label` only prefixes the status fallback.
 * Usage: `if (!res.ok) throw await apiError(res);`
 */
export async function apiError(res: Response, label = ''): Promise<Error> {
  const body = await res.json().catch(() => null) as { error?: { message?: string } } | null;
  const msg = body?.error?.message;
  return new Error(msg ? truncateError(msg) : `${label ? label + ' ' : ''}HTTP ${res.status}`);
}
