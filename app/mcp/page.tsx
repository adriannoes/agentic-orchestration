import { MCPManager } from "@/components/mcp-manager"

export default function MCPPage() {
  return (
    <div className="flex-1 overflow-auto">
      <div className="container mx-auto p-6 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">MCP Servers</h1>
          <p className="text-muted-foreground mt-2">Manage Model Context Protocol servers and their capabilities</p>
        </div>

        <MCPManager />
      </div>
    </div>
  )
}
