"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Search, Wrench, Globe, Database, Code, Sparkles } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { Tool } from "@/lib/types"

const categoryIcons: Record<string, React.ReactNode> = {
  web: <Globe className="w-5 h-5" />,
  data: <Database className="w-5 h-5" />,
  code: <Code className="w-5 h-5" />,
  utility: <Sparkles className="w-5 h-5" />,
}

const categoryColors: Record<string, string> = {
  web: "bg-blue-500/10 text-blue-500",
  data: "bg-green-500/10 text-green-500",
  code: "bg-purple-500/10 text-purple-500",
  utility: "bg-orange-500/10 text-orange-500",
}

export function ToolsLibrary() {
  const [tools, setTools] = useState<Tool[]>([])
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/tools")
      .then((res) => res.json())
      .then((data) => {
        setTools(data)
        setLoading(false)
      })
      .catch(console.error)
  }, [])

  const filteredTools = tools.filter(
    (tool) =>
      tool.name.toLowerCase().includes(search.toLowerCase()) ||
      tool.description.toLowerCase().includes(search.toLowerCase()),
  )

  const categories = ["all", "web", "data", "code", "utility"]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-pulse text-muted-foreground">Loading tools...</div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Tools Library</h1>
        <p className="text-muted-foreground">Browse and explore available tools for your agents</p>
      </div>

      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search tools..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <Tabs defaultValue="all">
        <TabsList className="mb-6">
          {categories.map((cat) => (
            <TabsTrigger key={cat} value={cat} className="capitalize">
              {cat === "all" ? "All Tools" : cat}
            </TabsTrigger>
          ))}
        </TabsList>

        {categories.map((cat) => (
          <TabsContent key={cat} value={cat}>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredTools
                .filter((tool) => cat === "all" || tool.category === cat)
                .map((tool) => (
                  <Card key={tool.id} className="hover:border-primary/50 transition-colors">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div
                          className={`flex items-center justify-center w-10 h-10 rounded-lg ${categoryColors[tool.category]}`}
                        >
                          {categoryIcons[tool.category] || <Wrench className="w-5 h-5" />}
                        </div>
                        <Badge variant="outline" className="capitalize">
                          {tool.category}
                        </Badge>
                      </div>
                      <CardTitle className="mt-3">{tool.name}</CardTitle>
                      <CardDescription>{tool.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <p className="text-xs text-muted-foreground font-medium">Input Schema</p>
                        <pre className="text-xs bg-muted p-2 rounded overflow-auto">
                          {JSON.stringify(tool.inputSchema, null, 2)}
                        </pre>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
