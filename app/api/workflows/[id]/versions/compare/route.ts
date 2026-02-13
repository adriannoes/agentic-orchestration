import { type NextRequest, NextResponse } from "next/server"
import { versionStore } from "@/lib/version-store"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const searchParams = request.nextUrl.searchParams
  const v1 = Number.parseInt(searchParams.get("v1") || "")
  const v2 = Number.parseInt(searchParams.get("v2") || "")

  if (isNaN(v1) || isNaN(v2)) {
    return NextResponse.json({ error: "Invalid version numbers" }, { status: 400 })
  }

  const comparison = versionStore.compareVersions(params.id, v1, v2)

  if (!comparison) {
    return NextResponse.json({ error: "Versions not found" }, { status: 404 })
  }

  return NextResponse.json(comparison)
}
