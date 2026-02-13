import { NextResponse } from "next/server"
import { connectorStore } from "@/lib/connector-store"

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const connector = connectorStore.getConnectorById(id)

  if (!connector) {
    return NextResponse.json({ error: "Connector not found" }, { status: 404 })
  }

  return NextResponse.json(connector)
}
