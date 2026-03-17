import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { connectorStore } from "@/lib/connector-store"

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params
  const result = await connectorStore.testConnection(id)
  return NextResponse.json(result)
}
