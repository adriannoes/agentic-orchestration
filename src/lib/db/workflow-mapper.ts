import type { Workflow } from "@/lib/workflow-types"

/** Supabase row shape (snake_case) */
export interface WorkflowRow {
  id: string
  workspace_id: string
  name: string
  description: string | null
  version: number
  nodes: unknown
  connections: unknown
  created_at: string
  updated_at: string
}

/**
 * Maps a Supabase workflow row (snake_case) to the frontend Workflow type (camelCase).
 * Supabase returns timestamps as ISO strings; we convert to Date.
 */
export function mapWorkflowRow(row: WorkflowRow): Workflow {
  return {
    id: row.id,
    name: row.name,
    description: row.description ?? "",
    nodes: Array.isArray(row.nodes) ? row.nodes : [],
    connections: Array.isArray(row.connections) ? row.connections : [],
    version: row.version ?? 1,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  }
}

export function mapWorkflowRows(rows: WorkflowRow[]): Workflow[] {
  return rows.map(mapWorkflowRow)
}
