import { NextResponse, type NextRequest } from "next/server"
import { workflowTemplates, searchTemplates, getPopularTemplates } from "@/lib/workflow-templates"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const query = searchParams.get("q")
  const popular = searchParams.get("popular")

  if (popular === "true") {
    return NextResponse.json(getPopularTemplates())
  }

  if (query) {
    return NextResponse.json(searchTemplates(query))
  }

  return NextResponse.json(workflowTemplates)
}
