"use client"

import { useState, useMemo } from "react"
import type { RegistryAgent } from "@/types/registry"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search } from "lucide-react"
import { RegistryAgentCard } from "./registry-agent-card"
import { RegistryAgentDetail } from "./registry-agent-detail"

interface RegistryContentProps {
  agents: RegistryAgent[]
  categories: string[]
}

export function RegistryContent({ agents, categories }: RegistryContentProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedAgent, setSelectedAgent] = useState<RegistryAgent | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)

  const filteredAgents = useMemo(() => {
    const byCategory =
      selectedCategory === "all"
        ? agents
        : agents.filter((agent) => agent.category === selectedCategory)
    if (!searchQuery.trim()) return byCategory
    const q = searchQuery.toLowerCase()
    return byCategory.filter(
      (agent) =>
        agent.name.toLowerCase().includes(q) ||
        agent.description.toLowerCase().includes(q) ||
        agent.id.toLowerCase().includes(q) ||
        agent.tags?.some((tag) => tag.toLowerCase().includes(q)),
    )
  }, [agents, searchQuery, selectedCategory])

  function handleViewDetails(agent: RegistryAgent) {
    setSelectedAgent(agent)
    setDetailOpen(true)
  }

  return (
    <div className="space-y-6">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search agents by name, description, or tags..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          {categories.map((cat) => (
            <TabsTrigger key={cat} value={cat} className="capitalize">
              {cat}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <p className="text-sm text-muted-foreground">
        Showing {filteredAgents.length} agent{filteredAgents.length !== 1 ? "s" : ""}
      </p>

      {filteredAgents.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredAgents.map((agent) => (
            <RegistryAgentCard
              key={agent.id}
              agent={agent}
              onViewDetails={handleViewDetails}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <p className="text-muted-foreground">No agents found</p>
          {searchQuery && (
            <p className="mt-1 text-sm text-muted-foreground">
              Try adjusting your search or filters
            </p>
          )}
        </div>
      )}

      <RegistryAgentDetail
        agent={selectedAgent}
        open={detailOpen}
        onOpenChange={setDetailOpen}
      />
    </div>
  )
}
