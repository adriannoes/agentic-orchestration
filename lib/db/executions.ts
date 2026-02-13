import { getSupabaseServerClient } from "@/lib/supabase/server"
import type { WorkflowExecution } from "@/lib/workflow-types"

export async function getExecutions(workspaceId: string): Promise<WorkflowExecution[]> {
  const supabase = await getSupabaseServerClient()
  const { data, error } = await supabase
    .from("workflow_executions")
    .select("*")
    .eq("workspace_id", workspaceId)
    .order("started_at", { ascending: false })

  if (error) throw error
  return data as WorkflowExecution[]
}

export async function getExecution(id: string): Promise<WorkflowExecution | null> {
  const supabase = await getSupabaseServerClient()
  const { data, error } = await supabase.from("workflow_executions").select("*").eq("id", id).single()

  if (error) return null
  return data as WorkflowExecution
}

export async function getExecutionsByWorkflow(workflowId: string): Promise<WorkflowExecution[]> {
  const supabase = await getSupabaseServerClient()
  const { data, error } = await supabase
    .from("workflow_executions")
    .select("*")
    .eq("workflow_id", workflowId)
    .order("started_at", { ascending: false })

  if (error) throw error
  return data as WorkflowExecution[]
}

export async function createExecution(
  workspaceId: string,
  execution: Omit<WorkflowExecution, "id">,
): Promise<WorkflowExecution> {
  const supabase = await getSupabaseServerClient()
  const { data, error } = await supabase
    .from("workflow_executions")
    .insert({
      workspace_id: workspaceId,
      workflow_id: execution.workflowId,
      status: execution.status,
      input: execution.input,
      result: execution.result,
      steps: execution.steps,
      started_at: execution.startedAt,
      completed_at: execution.completedAt,
      error: execution.error,
    })
    .select()
    .single()

  if (error) throw error
  return data as WorkflowExecution
}

export async function updateExecution(id: string, updates: Partial<WorkflowExecution>): Promise<WorkflowExecution> {
  const supabase = await getSupabaseServerClient()
  const { data, error } = await supabase
    .from("workflow_executions")
    .update({
      status: updates.status,
      result: updates.result,
      steps: updates.steps,
      completed_at: updates.completedAt,
      error: updates.error,
    })
    .eq("id", id)
    .select()
    .single()

  if (error) throw error
  return data as WorkflowExecution
}
