import { type NextRequest, NextResponse } from "next/server"
import { workflowStore } from "@/lib/workflow-store"
import { WorkflowExecutor } from "@/lib/workflow-executor"
import { executionStore } from "@/lib/execution-store"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { input } = await request.json()
    const workflow = workflowStore.getWorkflow(params.id)

    if (!workflow) {
      return NextResponse.json({ error: "Workflow not found" }, { status: 404 })
    }

    const executor = new WorkflowExecutor(workflow, input, (execution) => {
      executionStore.updateExecution(execution.id, execution)
    })

    const execution = await executor.execute()
    executionStore.addExecution(execution)

    return NextResponse.json(execution)
  } catch (error) {
    console.error("Workflow execution error:", error)
    return NextResponse.json({ error: "Failed to execute workflow" }, { status: 500 })
  }
}
