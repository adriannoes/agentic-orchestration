import { type NextRequest, NextResponse } from "next/server"
import { workflowStore } from "@/lib/workflow-store"

export async function POST(request: NextRequest) {
  try {
    const jsonData = await request.text()
    const workflow = workflowStore.importWorkflow(jsonData)

    if (!workflow) {
      return NextResponse.json({ error: "Failed to import workflow" }, { status: 400 })
    }

    return NextResponse.json(workflow)
  } catch (error) {
    return NextResponse.json({ error: "Invalid JSON data" }, { status: 400 })
  }
}
