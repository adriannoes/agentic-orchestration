import { type NextRequest, NextResponse } from "next/server"
import { versionStore } from "@/lib/version-store"

export async function GET(request: NextRequest, { params }: { params: { id: string; version: string } }) {
  const versionNumber = Number.parseInt(params.version)
  const version = versionStore.getVersion(params.id, versionNumber)

  if (!version) {
    return NextResponse.json({ error: "Version not found" }, { status: 404 })
  }

  return NextResponse.json(version)
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string; version: string } }) {
  const versionNumber = Number.parseInt(params.version)
  const success = versionStore.deleteVersion(params.id, versionNumber)

  if (!success) {
    return NextResponse.json({ error: "Version not found" }, { status: 404 })
  }

  return NextResponse.json({ success: true })
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string; version: string } }) {
  try {
    const { tag } = await request.json()
    const versionNumber = Number.parseInt(params.version)
    const success = versionStore.tagVersion(params.id, versionNumber, tag)

    if (!success) {
      return NextResponse.json({ error: "Version not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Version tag error:", error)
    return NextResponse.json({ error: "Failed to tag version" }, { status: 500 })
  }
}
