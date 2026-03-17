import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { MCPManager } from "@/components/mcp-manager"

export default async function MCPPage() {
  const session = await auth()
  if (!session) redirect("/login")
  return (
    <div className="flex-1 overflow-auto">
      <div className="container mx-auto max-w-7xl p-6">
        <div className="mb-8">
          <h1 className="text-3xl leading-snug font-bold tracking-tight">MCP Servers</h1>
          <p className="text-muted-foreground mt-2">
            Manage Model Context Protocol servers and their capabilities
          </p>
        </div>

        <MCPManager />
      </div>
    </div>
  )
}
