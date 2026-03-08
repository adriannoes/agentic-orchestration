import { getSupabaseServerClient } from "@/lib/supabase/server"
import type { Workflow, WorkflowNode, Connection } from "@/lib/workflow-types"
import { mapWorkflowRow, mapWorkflowRows, type WorkflowRow } from "./workflow-mapper"

// In-Memory cache for offline development without Supabase
// We use a global variable to persist across Next.js HMR
const globalForWorkflows = globalThis as unknown as { memoryWorkflows: Map<string, Workflow> }
const memoryWorkflows = globalForWorkflows.memoryWorkflows || new Map<string, Workflow>()
if (process.env.NODE_ENV !== "production") globalForWorkflows.memoryWorkflows = memoryWorkflows

export async function getWorkflows(workspaceId: string): Promise<Workflow[]> {
  const supabase = await getSupabaseServerClient()
  if (!supabase) return Array.from(memoryWorkflows.values())
  const { data, error } = await supabase
    .from("workflows")
    .select("*")
    .eq("workspace_id", workspaceId)
    .order("updated_at", { ascending: false })

  if (error) throw error
  return mapWorkflowRows((data ?? []) as WorkflowRow[])
}

export async function getWorkflow(id: string): Promise<Workflow | null> {
  const supabase = await getSupabaseServerClient()
  if (!supabase) return memoryWorkflows.get(id) || null
  const { data, error } = await supabase.from("workflows").select("*").eq("id", id).single()

  if (error || !data) return null
  return mapWorkflowRow(data as WorkflowRow)
}

export async function createWorkflow(
  workspaceId: string,
  workflow: Omit<Workflow, "id" | "version" | "createdAt" | "updatedAt">,
): Promise<Workflow> {
  const supabase = await getSupabaseServerClient()
  if (!supabase) {
    const newWorkflow: Workflow = {
      id: crypto.randomUUID(),
      workspaceId,
      name: workflow.name,
      description: workflow.description,
      nodes: workflow.nodes,
      connections: workflow.connections,
      version: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    memoryWorkflows.set(newWorkflow.id, newWorkflow)
    return newWorkflow
  }
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
  return mapWorkflowRow(data as WorkflowRow)
}

export async function updateWorkflow(id: string, updates: Partial<Workflow>): Promise<Workflow> {
  const supabase = await getSupabaseServerClient()
  if (!supabase) {
    const existing = memoryWorkflows.get(id)
    if (!existing) return { id, ...updates } as Workflow
    const updated = { ...existing, ...updates, updatedAt: new Date() }
    memoryWorkflows.set(id, updated as Workflow)
    return updated as Workflow
  }
  const payload: Record<string, unknown> = {}
  if (updates.name !== undefined) payload.name = updates.name
  if (updates.description !== undefined) payload.description = updates.description
  if (updates.nodes !== undefined) payload.nodes = updates.nodes
  if (updates.connections !== undefined) payload.connections = updates.connections

  const { data, error } = await supabase
    .from("workflows")
    .update(payload)
    .eq("id", id)
    .select()
    .single()

  if (error) throw error
  return mapWorkflowRow(data as WorkflowRow)
}

export async function deleteWorkflow(id: string): Promise<boolean> {
  const supabase = await getSupabaseServerClient()
  if (!supabase) {
    memoryWorkflows.delete(id)
    return true
  }
  const { error } = await supabase.from("workflows").delete().eq("id", id)

  return !error
}

export async function addWorkflowNode(
  workflowId: string,
  node: Omit<WorkflowNode, "id">,
): Promise<Workflow> {
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

  const updatedNodes = workflow.nodes.map((node) => {
    if (node.id !== nodeId) return node
    const merged = { ...node, ...updates }
    if (updates.parentId === null) delete merged.parentId
    return merged
  })

  return await updateWorkflow(workflowId, { nodes: updatedNodes })
}

export async function deleteWorkflowNode(workflowId: string, nodeId: string): Promise<Workflow> {
  const workflow = await getWorkflow(workflowId)
  if (!workflow) throw new Error("Workflow not found")

  const updatedNodes = workflow.nodes.filter((node) => node.id !== nodeId)
  const updatedConnections = workflow.connections.filter(
    (conn) => conn.sourceId !== nodeId && conn.targetId !== nodeId,
  )

  return await updateWorkflow(workflowId, { nodes: updatedNodes, connections: updatedConnections })
}

export async function addWorkflowConnection(
  workflowId: string,
  connection: Omit<Connection, "id">,
): Promise<Workflow> {
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

export async function deleteWorkflowConnection(
  workflowId: string,
  connectionId: string,
): Promise<Workflow> {
  const workflow = await getWorkflow(workflowId)
  if (!workflow) throw new Error("Workflow not found")

  const updatedConnections = workflow.connections.filter((conn) => conn.id !== connectionId)

  return await updateWorkflow(workflowId, { connections: updatedConnections })
}
