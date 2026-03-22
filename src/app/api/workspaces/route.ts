import { NextResponse } from "next/server"
import { getCurrentWorkspace, getUserWorkspaces } from "@/lib/db/workspaces"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const workspace = await getCurrentWorkspace()
    if (!workspace) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    return NextResponse.json(workspace)
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
