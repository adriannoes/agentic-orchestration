import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { Ratelimit } from "@upstash/ratelimit"
import { Redis } from "@upstash/redis"

const redisUrl = process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN

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

export async function middleware(request: NextRequest) {
  const allowedOrigin =
    process.env.NEXT_PUBLIC_ASAP_PROTOCOL_URL || "https://asap-protocol.vercel.app"
  const requestOrigin = request.headers.get("origin")

  // For /api routes, reject non-allowlisted cross-origin requests
  if (request.nextUrl.pathname.startsWith("/api")) {
    // Enforce API Rate Limit if configured
    if (ratelimit) {
      const ip = request.ip ?? request.headers.get("x-forwarded-for") ?? "anonymous"
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

    if (
      requestOrigin &&
      !requestOrigin.startsWith(allowedOrigin) &&
      !requestOrigin.startsWith("http://localhost")
    ) {
      return new NextResponse("Forbidden", { status: 403 })
    }

    if (request.method === "OPTIONS") {
      const preflightHeaders = {
        "Access-Control-Allow-Origin": requestOrigin || allowedOrigin,
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      }
      return NextResponse.json({}, { headers: preflightHeaders })
    }

    // Pass the request along with CORS headers attached to the response
    const response = NextResponse.next()
    response.headers.set("Access-Control-Allow-Origin", requestOrigin || allowedOrigin)
    response.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
    response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization")
    return response
  }

  return NextResponse.next()
}

export const config = {
  matcher: "/api/:path*",
}
