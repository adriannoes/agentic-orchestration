import { NextResponse } from "next/server"
import { withWorkspace } from "@/lib/api/with-workspace"
import { getWorkflows, createWorkflow } from "@/lib/db/workflows"

export async function GET() {
  const result = await withWorkspace()
  if (result.error) return result.error

  try {
    const workflows = await getWorkflows(result.workspace.id)
    return NextResponse.json(workflows)
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const result = await withWorkspace()
  if (result.error) return result.error

  const data = await request.json()
  const workflow = await createWorkflow(result.workspace.id, {
    name: data.name ?? "Untitled Workflow",
    description: data.description ?? "",
    nodes: data.nodes ?? [],
    connections: data.connections ?? [],
  })
  return NextResponse.json(workflow)
}
