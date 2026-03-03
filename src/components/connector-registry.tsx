"use client"

import { useState, useEffect } from "react"
import type { Connector, ConnectorCategory } from "@/lib/connector-types"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, Plug, CheckCircle2, AlertCircle } from "lucide-react"
import { ConnectorCard } from "./connector-card"
import { AddConnectionDialog } from "./add-connection-dialog"
import { useToast } from "@/hooks/use-toast"
import { useSearchParams } from "next/navigation"

const categories: { value: ConnectorCategory | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "ai", label: "AI" },
  { value: "storage", label: "Storage" },
  { value: "productivity", label: "Productivity" },
  { value: "communication", label: "Communication" },
  { value: "database", label: "Database" },
  { value: "mcp", label: "MCP" },
  { value: "analytics", label: "Analytics" },
]

export function ConnectorRegistry() {
  const [connectors, setConnectors] = useState<Connector[]>([])
  const [filteredConnectors, setFilteredConnectors] = useState<Connector[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [selectedConnector, setSelectedConnector] = useState<Connector | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const { toast } = useToast()
  const searchParams = useSearchParams()

  useEffect(() => {
    fetchConnectors()

    const success = searchParams?.get("success")
    const error = searchParams?.get("error")

    if (success === "connected") {
      toast({
        title: "Connected successfully",
        description: "Your integration has been authorized and connected.",
      })
    } else if (error) {
      toast({
        title: "Connection failed",
        description: error,
        variant: "destructive",
      })
    }
  }, [])

  useEffect(() => {
    filterConnectors()
  }, [connectors, searchQuery, selectedCategory])

  const fetchConnectors = async () => {
    const res = await fetch("/api/connectors")
    const data = await res.json()
    setConnectors(data)
  }

  const filterConnectors = () => {
    let filtered = connectors

    if (selectedCategory !== "all") {
      filtered = filtered.filter((c) => c.category === selectedCategory)
    }

    if (searchQuery) {
      filtered = filtered.filter(
        (c) =>
          c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.description.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }

    setFilteredConnectors(filtered)
  }

  const handleConnect = (connector: Connector) => {
    setSelectedConnector(connector)
    setDialogOpen(true)
  }

  const handleConnectionAdded = () => {
    setDialogOpen(false)
    fetchConnectors()
  }

  const connectedCount = connectors.filter((c) => c.status === "connected").length
  const totalCount = connectors.length

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-green-500/10">
              <CheckCircle2 className="w-6 h-6 text-green-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Connected</p>
              <p className="text-2xl font-bold">{connectedCount}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-primary/10">
              <Plug className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Available</p>
              <p className="text-2xl font-bold">{totalCount}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-orange-500/10">
              <AlertCircle className="w-6 h-6 text-orange-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Attention</p>
              <p className="text-2xl font-bold">0</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search connectors..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
        <TabsList className="w-full justify-start">
          {categories.map((cat) => (
            <TabsTrigger key={cat.value} value={cat.value}>
              {cat.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={selectedCategory} className="mt-6">
          {filteredConnectors.length === 0 ? (
            <Card className="p-12 text-center">
              <p className="text-muted-foreground">No connectors found</p>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredConnectors.map((connector) => (
                <ConnectorCard key={connector.id} connector={connector} onConnect={handleConnect} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {selectedConnector && (
        <AddConnectionDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          connector={selectedConnector}
          onSuccess={handleConnectionAdded}
        />
      )}
    </div>
  )
}
