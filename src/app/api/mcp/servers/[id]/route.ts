import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { mcpClient } from "@/lib/mcp-client"

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { id } = await params
  const server = mcpClient.getServer(id)

  if (!server) {
    return NextResponse.json({ error: "Server not found" }, { status: 404 })
  }

  return NextResponse.json(server)
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params

  try {
    await mcpClient.disconnectServer(id)
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 400 })
  }
}
