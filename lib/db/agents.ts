import { getSupabaseServerClient } from "@/lib/supabase/server"
import type { Agent } from "@/lib/types"

export async function getAgents(workspaceId: string): Promise<Agent[]> {
  const supabase = await getSupabaseServerClient()
  const { data, error } = await supabase
    .from("agents")
    .select("*")
    .eq("workspace_id", workspaceId)
    .order("created_at", { ascending: false })

  if (error) throw error
  return data as Agent[]
}

export async function getAgent(id: string): Promise<Agent | null> {
  const supabase = await getSupabaseServerClient()
  const { data, error } = await supabase.from("agents").select("*").eq("id", id).single()

  if (error) return null
  return data as Agent
}

export async function createAgent(
  workspaceId: string,
  agent: Omit<Agent, "id" | "createdAt" | "updatedAt">,
): Promise<Agent> {
  const supabase = await getSupabaseServerClient()
  const { data, error } = await supabase
    .from("agents")
    .insert({
      workspace_id: workspaceId,
      name: agent.name,
      description: agent.description,
      model: agent.model,
      system_prompt: agent.systemPrompt,
      tools: agent.tools,
    })
    .select()
    .single()

  if (error) throw error
  return data as Agent
}

export async function updateAgent(id: string, updates: Partial<Agent>): Promise<Agent> {
  const supabase = await getSupabaseServerClient()
  const { data, error } = await supabase
    .from("agents")
    .update({
      name: updates.name,
      description: updates.description,
      model: updates.model,
      system_prompt: updates.systemPrompt,
      tools: updates.tools,
    })
    .eq("id", id)
    .select()
    .single()

  if (error) throw error
  return data as Agent
}

export async function deleteAgent(id: string): Promise<boolean> {
  const supabase = await getSupabaseServerClient()
  const { error } = await supabase.from("agents").delete().eq("id", id)

  return !error
}
