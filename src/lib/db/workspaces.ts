import { getSupabaseServerClient } from "@/lib/supabase/server"
import { getCurrentUser } from "@/lib/auth/actions"

export interface Workspace {
  id: string
  name: string
}

export interface WorkspaceWithRole extends Workspace {
  role: string
}

const LOCAL_WORKSPACE: Workspace = { id: "local-workspace", name: "Local Workspace" }
const LOCAL_WORKSPACE_WITH_ROLE: WorkspaceWithRole = { ...LOCAL_WORKSPACE, role: "admin" }

export async function getCurrentWorkspace(): Promise<Workspace | null> {
  const supabase = await getSupabaseServerClient()
  if (!supabase) return LOCAL_WORKSPACE

  const user = await getCurrentUser()

  if (!user) return null

  const { data, error } = await supabase
    .from("workspace_members")
    .select("workspace_id, workspaces(*)")
    .eq("user_id", user.id)
    .limit(1)
    .single()

  if (error || !data?.workspaces) {
    return LOCAL_WORKSPACE
  }
  const ws = data.workspaces as unknown as Workspace
  return ws
}

export async function getUserWorkspaces(): Promise<WorkspaceWithRole[]> {
  const supabase = await getSupabaseServerClient()
  if (!supabase) return [LOCAL_WORKSPACE_WITH_ROLE]

  const user = await getCurrentUser()

  if (!user) return []

  const { data, error } = await supabase
    .from("workspace_members")
    .select("workspace_id, role, workspaces(*)")
    .eq("user_id", user.id)

  if (error || !data?.length) {
    return [LOCAL_WORKSPACE_WITH_ROLE]
  }
  return data.map((item) => ({ ...(item.workspaces as unknown as Workspace), role: item.role }))
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
