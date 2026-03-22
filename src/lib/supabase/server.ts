import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { auth } from "@/auth"

export async function getSupabaseServerClient() {
  const cookieStore = await cookies()

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  // Natively intercept the Superuser Key to securely bypass eccentric RLS GoTrue JWT bugs!
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  const activeKey = serviceRoleKey || anonKey

  if (!url || !activeKey) return null

  const supabase = createServerClient(url, activeKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
        } catch {
          // Ignore headers-sent errors
        }
      },
    },
  })

  return supabase
}
