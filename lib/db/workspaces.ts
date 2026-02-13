import { getSupabaseServerClient } from "@/lib/supabase/server"
import { getCurrentUser } from "@/lib/auth/actions"

export async function getCurrentWorkspace() {
  const supabase = await getSupabaseServerClient()
  const user = await getCurrentUser()

  if (!user) return null

  const { data, error } = await supabase
    .from("workspace_members")
    .select("workspace_id, workspaces(*)")
    .eq("user_id", user.id)
    .limit(1)
    .single()

  if (error) return null
  return data.workspaces
}

export async function getUserWorkspaces() {
  const supabase = await getSupabaseServerClient()
  const user = await getCurrentUser()

  if (!user) return []

  const { data, error } = await supabase
    .from("workspace_members")
    .select("workspace_id, role, workspaces(*)")
    .eq("user_id", user.id)

  if (error) return []
  return data.map((item) => ({ ...item.workspaces, role: item.role }))
}

export async function getWorkspaceMembers(workspaceId: string) {
  const supabase = await getSupabaseServerClient()

  const { data, error } = await supabase
    .from("workspace_members")
    .select("*, profiles(*)")
    .eq("workspace_id", workspaceId)

  if (error) return []
  return data
}
