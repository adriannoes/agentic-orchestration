import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { connectorStore } from "@/lib/connector-store"

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { id } = await params
  const connector = connectorStore.getConnectorById(id)

  if (!connector) {
    return NextResponse.json({ error: "Connector not found" }, { status: 404 })
  }

  return NextResponse.json(connector)
}
