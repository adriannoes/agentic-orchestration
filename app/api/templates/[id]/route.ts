import { type NextRequest, NextResponse } from "next/server"
import { workflowTemplates } from "@/lib/workflow-templates"
import { workflowStore } from "@/lib/workflow-store"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const template = workflowTemplates.find((t) => t.id === params.id)

  if (!template) {
    return NextResponse.json({ error: "Template not found" }, { status: 404 })
  }

  return NextResponse.json(template)
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { name } = await request.json()
    const template = workflowTemplates.find((t) => t.id === params.id)

    if (!template) {
      return NextResponse.json({ error: "Template not found" }, { status: 404 })
    }

    // Create workflow from template
    const nodes = template.nodes.map((node, index) => ({
      ...node,
      id: `node-${index}`,
    }))

    const connections = template.connections.map((conn, index) => ({
      ...conn,
      id: `conn-${index}`,
      sourceId: `node-${template.nodes.findIndex((n) => n === template.nodes[Number.parseInt(conn.sourceId.split("-")[1] || "0")])}`,
      targetId: `node-${template.nodes.findIndex((n) => n === template.nodes[Number.parseInt(conn.targetId.split("-")[1] || "0")])}`,
    }))

    const workflow = workflowStore.createWorkflow({
      name: name || template.name,
      description: template.description,
      nodes,
      connections,
    })

    return NextResponse.json(workflow)
  } catch (error) {
    console.error("Template instantiation error:", error)
    return NextResponse.json({ error: "Failed to create workflow from template" }, { status: 500 })
  }
}
