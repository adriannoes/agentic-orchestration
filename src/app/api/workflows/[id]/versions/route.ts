import { type NextRequest, NextResponse } from "next/server"
import { withWorkspace } from "@/lib/api/with-workspace"
import { getWorkflow } from "@/lib/db/workflows"
import { versionStore } from "@/lib/version-store"

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const result = await withWorkspace()
  if (result.error) return result.error

  const { id } = await params
  const versions = versionStore.getVersions(id)
  return NextResponse.json(versions)
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const result = await withWorkspace()
  if (result.error) return result.error

  try {
    const { id } = await params
    const { description } = await request.json()
    const workflow = await getWorkflow(id)

    if (!workflow) {
      return NextResponse.json({ error: "Workflow not found" }, { status: 404 })
    }

    const version = versionStore.createVersion(workflow, description)
    return NextResponse.json(version)
  } catch (error) {
    console.error("Version creation error:", error instanceof Error ? error.message : String(error))
    return NextResponse.json({ error: "Failed to create version" }, { status: 500 })
  }
}
