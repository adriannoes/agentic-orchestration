import { Suspense } from "react"
import { ConnectorRegistry } from "@/components/connector-registry"

export default function ConnectorsPage() {
  return (
    <div className="flex-1 overflow-auto">
      <div className="container mx-auto max-w-7xl p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Connector Registry</h1>
          <p className="text-muted-foreground mt-2">
            Manage all your data and tool connections in one place
          </p>
        </div>
        <Suspense
          fallback={
            <div className="text-muted-foreground flex min-h-[200px] items-center justify-center">
              Loading…
            </div>
          }
        >
          <ConnectorRegistry />
        </Suspense>
      </div>
    </div>
  )
}
