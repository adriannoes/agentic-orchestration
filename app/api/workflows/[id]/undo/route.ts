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
  const previousWorkflow = historyManager.undo(workflow)

  if (!previousWorkflow) {
    return NextResponse.json({ error: "Nothing to undo" }, { status: 400 })
  }

  workflowStore.updateWorkflow(workflowId, {
    nodes: previousWorkflow.nodes,
    connections: previousWorkflow.connections,
  })

  return NextResponse.json(workflowStore.getWorkflow(workflowId))
}
