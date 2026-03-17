import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { mcpClient } from "@/lib/mcp-client"

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params
  const tools = mcpClient.getToolsByServer(id)
  return NextResponse.json(tools)
}
