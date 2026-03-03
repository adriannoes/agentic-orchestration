import { store } from "@/lib/store"
import { NextResponse } from "next/server"

export async function GET() {
  const agents = store.getAgents()
  return NextResponse.json(agents)
}

export async function POST(req: Request) {
  const body = await req.json()
  const agent = store.createAgent(body)
  return NextResponse.json(agent)
}
