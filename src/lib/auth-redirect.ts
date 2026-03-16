/**
 * Validates redirect URLs against an allowlist (baseUrl and optionally asapUrl).
 *
 * Security: Only URLs starting with baseUrl or asapUrl are allowed; all others
 * fall back to baseUrl. This prevents open redirect vulnerabilities in the
 * ASAP Protocol flow.
 *
 * @param url - The redirect URL to validate
 * @param baseUrl - The primary allowed base URL (fallback for invalid URLs)
 * @param asapUrl - Optional ASAP Protocol base URL to allow
 * @returns The validated URL if allowlisted, otherwise baseUrl
 */
export function resolveRedirectUrl(url: string, baseUrl: string, asapUrl?: string): string {
  if (asapUrl && url.startsWith(asapUrl)) return url
  if (url.startsWith(baseUrl)) return url
  return baseUrl
}
