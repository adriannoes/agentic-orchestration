import { getSupabaseServerClient } from "@/lib/supabase/server"
import type { Workflow, WorkflowNode, Connection } from "@/lib/workflow-types"

export async function getWorkflows(workspaceId: string): Promise<Workflow[]> {
  const supabase = await getSupabaseServerClient()
  const { data, error } = await supabase
    .from("workflows")
    .select("*")
    .eq("workspace_id", workspaceId)
    .order("updated_at", { ascending: false })

  if (error) throw error
  return data as Workflow[]
}

export async function getWorkflow(id: string): Promise<Workflow | null> {
  const supabase = await getSupabaseServerClient()
  const { data, error } = await supabase.from("workflows").select("*").eq("id", id).single()

  if (error) return null
  return data as Workflow
}

export async function createWorkflow(
  workspaceId: string,
  workflow: Omit<Workflow, "id" | "version" | "createdAt" | "updatedAt">,
): Promise<Workflow> {
  const supabase = await getSupabaseServerClient()
  const { data, error } = await supabase
    .from("workflows")
    .insert({
      workspace_id: workspaceId,
      name: workflow.name,
      description: workflow.description,
      nodes: workflow.nodes,
      connections: workflow.connections,
    })
    .select()
    .single()

  if (error) throw error
  return data as Workflow
}

export async function updateWorkflow(id: string, updates: Partial<Workflow>): Promise<Workflow> {
  const supabase = await getSupabaseServerClient()
  const { data, error } = await supabase
    .from("workflows")
    .update({
      name: updates.name,
      description: updates.description,
      nodes: updates.nodes,
      connections: updates.connections,
    })
    .eq("id", id)
    .select()
    .single()

  if (error) throw error
  return data as Workflow
}

export async function deleteWorkflow(id: string): Promise<boolean> {
  const supabase = await getSupabaseServerClient()
  const { error } = await supabase.from("workflows").delete().eq("id", id)

  return !error
}

export async function addWorkflowNode(workflowId: string, node: Omit<WorkflowNode, "id">): Promise<Workflow> {
  const workflow = await getWorkflow(workflowId)
  if (!workflow) throw new Error("Workflow not found")

  const newNode: WorkflowNode = { ...node, id: crypto.randomUUID() }
  const updatedNodes = [...workflow.nodes, newNode]

  return await updateWorkflow(workflowId, { nodes: updatedNodes })
}

export async function updateWorkflowNode(
  workflowId: string,
  nodeId: string,
  updates: Partial<WorkflowNode>,
): Promise<Workflow> {
  const workflow = await getWorkflow(workflowId)
  if (!workflow) throw new Error("Workflow not found")

  const updatedNodes = workflow.nodes.map((node) => (node.id === nodeId ? { ...node, ...updates } : node))

  return await updateWorkflow(workflowId, { nodes: updatedNodes })
}

export async function deleteWorkflowNode(workflowId: string, nodeId: string): Promise<Workflow> {
  const workflow = await getWorkflow(workflowId)
  if (!workflow) throw new Error("Workflow not found")

  const updatedNodes = workflow.nodes.filter((node) => node.id !== nodeId)
  const updatedConnections = workflow.connections.filter((conn) => conn.sourceId !== nodeId && conn.targetId !== nodeId)

  return await updateWorkflow(workflowId, { nodes: updatedNodes, connections: updatedConnections })
}

export async function addWorkflowConnection(workflowId: string, connection: Omit<Connection, "id">): Promise<Workflow> {
  const workflow = await getWorkflow(workflowId)
  if (!workflow) throw new Error("Workflow not found")

  const exists = workflow.connections.some(
    (c) => c.sourceId === connection.sourceId && c.targetId === connection.targetId,
  )
  if (exists) throw new Error("Connection already exists")

  const newConnection: Connection = { ...connection, id: crypto.randomUUID() }
  const updatedConnections = [...workflow.connections, newConnection]

  return await updateWorkflow(workflowId, { connections: updatedConnections })
}

export async function deleteWorkflowConnection(workflowId: string, connectionId: string): Promise<Workflow> {
  const workflow = await getWorkflow(workflowId)
  if (!workflow) throw new Error("Workflow not found")

  const updatedConnections = workflow.connections.filter((conn) => conn.id !== connectionId)

  return await updateWorkflow(workflowId, { connections: updatedConnections })
}
