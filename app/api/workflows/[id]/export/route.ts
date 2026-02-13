import { type NextRequest, NextResponse } from "next/server"
import { workflowStore } from "@/lib/workflow-store"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const workflowId = params.id
  const jsonData = workflowStore.exportWorkflow(workflowId)

  if (!jsonData) {
    return NextResponse.json({ error: "Workflow not found" }, { status: 404 })
  }

  const workflow = workflowStore.getWorkflow(workflowId)
  const filename = `${workflow?.name.replace(/\s+/g, "-").toLowerCase() || "workflow"}.json`

  return new NextResponse(jsonData, {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  })
}
