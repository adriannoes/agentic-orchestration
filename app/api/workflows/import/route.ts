import { type NextRequest, NextResponse } from "next/server"
import { withWorkspace } from "@/lib/api/with-workspace"
import { createWorkflow } from "@/lib/db/workflows"

export async function POST(request: NextRequest) {
  const result = await withWorkspace()
  if (result.error) return result.error

  try {
    const jsonData = await request.text()
    const data = JSON.parse(jsonData)

    const workflow = await createWorkflow(result.workspace.id, {
      name: data.name ?? "Imported Workflow",
      description: data.description ?? "",
      nodes: data.nodes ?? [],
      connections: data.connections ?? [],
    })

    return NextResponse.json(workflow)
  } catch {
    return NextResponse.json({ error: "Failed to import workflow" }, { status: 400 })
  }
}
