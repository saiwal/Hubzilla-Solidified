// Step 2 plumbing check: proves theme-solidified can import @utsukta/spa-core
// via the npm workspace. Step 3 replaces this with the real moved-in
// lib/store/i18n/module-registry code.
export const SPA_CORE_PLACEHOLDER = "spa-core-linked" as const;
