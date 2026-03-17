import { type NextRequest, NextResponse } from "next/server"
import { withWorkspace } from "@/lib/api/with-workspace"
import { versionStore } from "@/lib/version-store"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; version: string }> },
) {
  const result = await withWorkspace()
  if (result.error) return result.error

  const { id, version } = await params
  const versionNumber = Number.parseInt(version)
  const versionData = versionStore.getVersion(id, versionNumber)

  if (!versionData) {
    return NextResponse.json({ error: "Version not found" }, { status: 404 })
  }

  return NextResponse.json(versionData)
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; version: string }> },
) {
  const result = await withWorkspace()
  if (result.error) return result.error

  const { id, version } = await params
  const versionNumber = Number.parseInt(version)
  const success = versionStore.deleteVersion(id, versionNumber)

  if (!success) {
    return NextResponse.json({ error: "Version not found" }, { status: 404 })
  }

  return NextResponse.json({ success: true })
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; version: string }> },
) {
  const result = await withWorkspace()
  if (result.error) return result.error

  try {
    const { id, version } = await params
    const { tag } = await request.json()
    const versionNumber = Number.parseInt(version)
    const success = versionStore.tagVersion(id, versionNumber, tag)

    if (!success) {
      return NextResponse.json({ error: "Version not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Version tag error:", error instanceof Error ? error.message : String(error))
    return NextResponse.json({ error: "Failed to tag version" }, { status: 500 })
  }
}
