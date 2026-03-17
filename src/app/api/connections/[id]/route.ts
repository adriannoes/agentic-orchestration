import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { connectorStore } from "@/lib/connector-store"

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { id } = await params
  const connections = connectorStore.getConnectionsByConnector(id)
  return NextResponse.json(connections)
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params
  const body = await request.json()
  const connection = connectorStore.updateConnection(id, body)

  if (!connection) {
    return NextResponse.json({ error: "Connection not found" }, { status: 404 })
  }

  return NextResponse.json(connection)
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params
  const success = connectorStore.deleteConnection(id)

  if (!success) {
    return NextResponse.json({ error: "Connection not found" }, { status: 404 })
  }

  return NextResponse.json({ success: true })
}
