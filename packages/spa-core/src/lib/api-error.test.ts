// node --experimental-strip-types packages/spa-core/src/lib/api-error.test.ts
import assert from "node:assert";
import { apiError, truncateError, ERROR_MAX_LEN } from "./api-error.ts";

const json = (body: unknown, status: number) =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });

// Server message wins over the status code.
assert.equal(
  (await apiError(json({ error: { status: 403, message: "Permission denied" } }, 403))).message,
  "Permission denied",
);

// No parseable body → status fallback, with the optional label.
assert.equal((await apiError(new Response("<html>", { status: 500 }))).message, "HTTP 500");
assert.equal((await apiError(new Response("", { status: 404 }), "permcats")).message, "permcats HTTP 404");

// Long server text (PHP notice + stack trace) is clamped.
const long = "x".repeat(500);
const clamped = (await apiError(json({ error: { message: long } }, 500))).message;
assert.equal(clamped.length, ERROR_MAX_LEN);
assert.ok(clamped.endsWith("…"));

// Short text is left alone.
assert.equal(truncateError("boom"), "boom");

console.log("ok");
