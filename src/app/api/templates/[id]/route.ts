import { type NextRequest, NextResponse } from "next/server"
import { workflowTemplates } from "@/lib/workflow-templates"
import { withWorkspace } from "@/lib/api/with-workspace"
import { createWorkflow } from "@/lib/db/workflows"

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const template = workflowTemplates.find((t) => t.id === id)

  if (!template) {
    return NextResponse.json({ error: "Template not found" }, { status: 404 })
  }

  return NextResponse.json(template)
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const result = await withWorkspace()
  if (result.error) return result.error

  try {
    const { id } = await params
    const { name } = await request.json()
    const template = workflowTemplates.find((t) => t.id === id)

    if (!template) {
      return NextResponse.json({ error: "Template not found" }, { status: 404 })
    }

    const nodes = template.nodes.map((node, index) => ({
      ...node,
      id: `node-${index}`,
    }))

    const connections = template.connections.map((conn, index) => ({
      ...conn,
      id: `conn-${index}`,
    }))

    const workflow = await createWorkflow(result.workspace.id, {
      name: name ?? template.name,
      description: template.description ?? "",
      nodes,
      connections,
    })

    return NextResponse.json(workflow)
  } catch (error) {
    console.error(
      "Template instantiation error:",
      error instanceof Error ? error.message : String(error),
    )
    return NextResponse.json({ error: "Failed to create workflow from template" }, { status: 500 })
  }
}
