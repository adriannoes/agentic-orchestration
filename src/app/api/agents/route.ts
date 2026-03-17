import { auth } from "@/auth"
import { store } from "@/lib/store"
import { NextResponse } from "next/server"

export async function GET() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const agents = store.getAgents()
  return NextResponse.json(agents)
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json()
  const agent = store.createAgent(body)
  return NextResponse.json(agent)
}
