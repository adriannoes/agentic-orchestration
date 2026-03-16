import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { Ratelimit } from "@upstash/ratelimit"
import { Redis } from "@upstash/redis"

const redisUrl = process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN

export function isE2ERateLimitBypass(): boolean {
  return (
    process.env.NODE_ENV !== "production" &&
    (process.env.PLAYWRIGHT_E2E === "1" || process.env.CI === "true")
  )
}

// Create a global rate limiter instance allowing 20 requests per 10 seconds (only active if env vars are present).
const ratelimit =
  redisUrl && redisToken
    ? new Ratelimit({
        redis: new Redis({
          url: redisUrl,
          token: redisToken,
        }),
        limiter: Ratelimit.slidingWindow(20, "10 s"),
        analytics: true,
      })
    : null

export async function proxy(request: NextRequest) {
  const allowedOriginAsap = process.env.NEXT_PUBLIC_ASAP_PROTOCOL_URL
  const allowedOriginSelf = process.env.NEXT_PUBLIC_APP_URL
  const requestOrigin = request.headers.get("origin")

  // For /api routes, reject non-allowlisted cross-origin requests
  if (request.nextUrl.pathname.startsWith("/api")) {
    if (ratelimit && !isE2ERateLimitBypass()) {
      const forwarded = request.headers.get("x-forwarded-for")
      const ip = forwarded?.split(",")[0]?.trim() ?? request.headers.get("x-real-ip") ?? "anonymous"
      const { success, limit, reset, remaining } = await ratelimit.limit(ip)

      if (!success) {
        return new NextResponse("Too Many Requests", {
          status: 429,
          headers: {
            "X-RateLimit-Limit": limit.toString(),
            "X-RateLimit-Remaining": remaining.toString(),
            "X-RateLimit-Reset": reset.toString(),
          },
        })
      }
    }

    const isAllowedOrigin =
      !requestOrigin ||
      (allowedOriginAsap && requestOrigin.startsWith(allowedOriginAsap)) ||
      (allowedOriginSelf && requestOrigin.startsWith(allowedOriginSelf)) ||
      (process.env.NODE_ENV === "development" && requestOrigin.startsWith("http://localhost"))

    if (!isAllowedOrigin) {
      return new NextResponse("Forbidden", { status: 403 })
    }

    const responseHeaders = {
      "Access-Control-Allow-Origin": requestOrigin || allowedOriginSelf || "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    }

    if (request.method === "OPTIONS") {
      return NextResponse.json({}, { headers: responseHeaders })
    }

    // Pass the request along with CORS headers attached to the response
    const response = NextResponse.next()
    Object.entries(responseHeaders).forEach(([key, value]) => {
      response.headers.set(key, value)
    })
    return response
  }

  return NextResponse.next()
}

export const config = {
  matcher: "/api/:path*",
}
