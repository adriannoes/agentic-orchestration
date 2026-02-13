import { NextResponse } from "next/server"

export async function GET() {
  const configured = !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

  return NextResponse.json({
    configured,
    url: process.env.NEXT_PUBLIC_SUPABASE_URL || null,
  })
}
