import { type NextRequest, NextResponse } from "next/server"
import { workflowStore } from "@/lib/workflow-store"
import { versionStore } from "@/lib/version-store"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const versions = versionStore.getVersions(params.id)
  return NextResponse.json(versions)
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { description } = await request.json()
    const workflow = workflowStore.getWorkflow(params.id)

    if (!workflow) {
      return NextResponse.json({ error: "Workflow not found" }, { status: 404 })
    }

    const version = versionStore.createVersion(workflow, description)
    return NextResponse.json(version)
  } catch (error) {
    console.error("Version creation error:", error)
    return NextResponse.json({ error: "Failed to create version" }, { status: 500 })
  }
}
