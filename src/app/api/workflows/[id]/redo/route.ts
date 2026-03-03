import { type NextRequest, NextResponse } from "next/server"
import { withWorkspace } from "@/lib/api/with-workspace"
import { getWorkflow, updateWorkflow } from "@/lib/db/workflows"
import { getHistoryManager } from "@/lib/history-manager"

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const result = await withWorkspace()
  if (result.error) return result.error

  const { id: workflowId } = await params
  const workflow = await getWorkflow(workflowId)

  if (!workflow) {
    return NextResponse.json({ error: "Workflow not found" }, { status: 404 })
  }

  const historyManager = getHistoryManager(workflowId)
  const nextWorkflow = historyManager.redo(workflow)

  if (!nextWorkflow) {
    return NextResponse.json({ error: "Nothing to redo" }, { status: 400 })
  }

  const updated = await updateWorkflow(workflowId, {
    nodes: nextWorkflow.nodes,
    connections: nextWorkflow.connections,
  })

  return NextResponse.json(updated)
}
