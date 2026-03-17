import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { connectorStore } from "@/lib/connector-store"

export async function GET(request: Request) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { searchParams } = new URL(request.url)
  const category = searchParams.get("category")

  const connectors = category
    ? connectorStore.getConnectorsByCategory(category)
    : connectorStore.getConnectors()

  return NextResponse.json(connectors)
}
