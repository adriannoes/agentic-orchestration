import { NextResponse } from "next/server"
import { getCurrentWorkspace } from "@/lib/db/workspaces"

export type WorkspaceResult =
  | { workspace: NonNullable<Awaited<ReturnType<typeof getCurrentWorkspace>>>; error?: never }
  | { workspace?: never; error: NextResponse }

/**
 * Helper that gets the current workspace. Returns 401 if user is not authenticated
 * (getCurrentWorkspace returns null when there is no user).
 */
export async function withWorkspace(): Promise<WorkspaceResult> {
  const workspace = await getCurrentWorkspace()

  if (!workspace) {
    return {
      error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    }
  }

  return { workspace }
}
