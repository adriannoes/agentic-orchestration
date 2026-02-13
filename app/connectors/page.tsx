import { ConnectorRegistry } from "@/components/connector-registry"

export default function ConnectorsPage() {
  return (
    <div className="flex-1 overflow-auto">
      <div className="container mx-auto p-6 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Connector Registry</h1>
          <p className="text-muted-foreground mt-2">Manage all your data and tool connections in one place</p>
        </div>

        <ConnectorRegistry />
      </div>
    </div>
  )
}
