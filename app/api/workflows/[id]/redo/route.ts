import { type NextRequest, NextResponse } from "next/server"
import { workflowStore } from "@/lib/workflow-store"
import { getHistoryManager } from "@/lib/history-manager"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const workflowId = params.id
  const workflow = workflowStore.getWorkflow(workflowId)

  if (!workflow) {
    return NextResponse.json({ error: "Workflow not found" }, { status: 404 })
  }

  const historyManager = getHistoryManager(workflowId)
  const nextWorkflow = historyManager.redo(workflow)

  if (!nextWorkflow) {
    return NextResponse.json({ error: "Nothing to redo" }, { status: 400 })
  }

  workflowStore.updateWorkflow(workflowId, {
    nodes: nextWorkflow.nodes,
    connections: nextWorkflow.connections,
  })

  return NextResponse.json(workflowStore.getWorkflow(workflowId))
}
