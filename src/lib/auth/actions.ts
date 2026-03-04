"use server"

import { auth, signOut as nextAuthSignOut } from "@/auth"
import { revalidatePath } from "next/cache"
import { getSupabaseServerClient } from "@/lib/supabase/server"

export async function signOut() {
  await nextAuthSignOut({ redirectTo: "/login" })
  revalidatePath("/", "layout")
}

export async function getCurrentUser() {
  const session = await auth()
  return session?.user ?? null
}

function sessionUserToProfile(user: { id: string; name?: string | null; email?: string | null; image?: string | null }) {
  return { id: user.id, full_name: user.name ?? undefined, email: user.email ?? undefined, avatar_url: user.image ?? undefined }
}

export async function getProfile() {
  const user = await getCurrentUser()
  if (!user?.id) return null

  const hasSupabase =
    !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!hasSupabase) return sessionUserToProfile(user)

  const supabase = await getSupabaseServerClient()
  if (!supabase) return sessionUserToProfile(user)
  const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single()
  return data ?? sessionUserToProfile(user)
}
