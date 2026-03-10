import { getSupabaseServerClient } from "@/lib/supabase/server"
import { getCurrentUser } from "@/lib/auth/actions"

export async function getCurrentWorkspace() {
  const supabase = await getSupabaseServerClient()
  if (!supabase) return { id: "local-workspace", name: "Local Workspace" } as any

  const user = await getCurrentUser()

  if (!user) return null

  const { data, error } = await supabase
    .from("workspace_members")
    .select("workspace_id, workspaces(*)")
    .eq("user_id", user.id)
    .limit(1)
    .single()

  if (error || !data?.workspaces) {
    return { id: "local-workspace", name: "Local Workspace" } as any
  }
  return data.workspaces as any
}

export async function getUserWorkspaces() {
  const supabase = await getSupabaseServerClient()
  if (!supabase) return [{ id: "local-workspace", name: "Local Workspace", role: "admin" }] as any

  const user = await getCurrentUser()

  if (!user) return []

  const { data, error } = await supabase
    .from("workspace_members")
    .select("workspace_id, role, workspaces(*)")
    .eq("user_id", user.id)

  if (error || !data?.length) {
    return [{ id: "local-workspace", name: "Local Workspace", role: "admin" }] as any
  }
  return data.map((item) => ({ ...item.workspaces, role: item.role }))
}

export async function getWorkspaceMembers(workspaceId: string) {
  const supabase = await getSupabaseServerClient()
  if (!supabase) return []

  const { data, error } = await supabase
    .from("workspace_members")
    .select("*, profiles(*)")
    .eq("workspace_id", workspaceId)

  if (error) return []
  return data
}
