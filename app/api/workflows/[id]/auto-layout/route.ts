import { type NextRequest, NextResponse } from "next/server"
import { workflowStore } from "@/lib/workflow-store"
import { autoLayout } from "@/lib/auto-layout"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const workflowId = params.id
  const workflow = workflowStore.getWorkflow(workflowId)

  if (!workflow) {
    return NextResponse.json({ error: "Workflow not found" }, { status: 404 })
  }

  const layoutedNodes = autoLayout.applyLayout(workflow.nodes, workflow.connections)

  workflowStore.updateWorkflow(workflowId, {
    nodes: layoutedNodes,
  })

  return NextResponse.json(workflowStore.getWorkflow(workflowId))
}
