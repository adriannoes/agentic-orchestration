/**
 * Resolves the redirect URL for NextAuth callbacks.
 * Allows ASAP Protocol URL redirects when configured, same-origin URLs, or falls back to baseUrl.
 */
export function resolveRedirectUrl(url: string, baseUrl: string, asapUrl?: string): string {
  if (asapUrl && url.startsWith(asapUrl)) return url
  if (url.startsWith(baseUrl)) return url
  return baseUrl
}
