import { auth } from "@/auth"
import { store } from "@/lib/store"
import { NextResponse } from "next/server"

export async function GET() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const tools = store.getTools()
  return NextResponse.json(tools)
}
