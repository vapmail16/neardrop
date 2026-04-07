/** Origin for server-side fetch (layout, RSC) — must match `API_UPSTREAM` in `next.config.mjs` rewrites. */
export function getInternalApiOrigin(): string {
  return process.env.API_UPSTREAM ?? 'http://127.0.0.1:3010';
}
