import { store } from "@/lib/store"
import { NextResponse } from "next/server"

export async function GET() {
  const tools = store.getTools()
  return NextResponse.json(tools)
}
