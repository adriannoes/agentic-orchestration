import { getSupabaseServerClient } from "@/lib/supabase/server"
import { resolveRedirectUrl } from "@/lib/auth-redirect"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || requestUrl.origin

  if (code) {
    const supabase = await getSupabaseServerClient()
    if (supabase) await supabase.auth.exchangeCodeForSession(code)
  }

  const target = resolveRedirectUrl(`${requestUrl.origin}/`, baseUrl)
  return NextResponse.redirect(target)
}
