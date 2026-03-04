"use client"

import type React from "react"

import { useState } from "react"
import { Search, Sparkles, Users, BarChart3, FileText, Zap, TrendingUp, ArrowRight } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { WorkflowTemplate } from "@/lib/workflow-templates"
import useSWR from "swr"
import { useRouter } from "next/navigation"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

const categoryIcons: Record<string, React.ElementType> = {
  "customer-support": Users,
  "data-analysis": BarChart3,
  "content-creation": FileText,
  automation: Zap,
  research: Sparkles,
}

const categoryColors: Record<string, string> = {
  "customer-support": "text-indigo-300 bg-indigo-500/10 border border-indigo-500/20",
  "data-analysis": "text-violet-300 bg-violet-500/10 border border-violet-500/20",
  "content-creation": "text-zinc-200 bg-zinc-500/10 border border-zinc-500/20",
  automation: "text-indigo-300 bg-indigo-500/10 border border-indigo-500/20",
  research: "text-violet-300 bg-violet-500/10 border border-violet-500/20",
}

export function TemplatesLibrary() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  const { data: allTemplates } = useSWR<WorkflowTemplate[]>("/api/templates", fetcher)
  const { data: popularTemplates } = useSWR<WorkflowTemplate[]>("/api/templates?popular=true", fetcher)

  const filteredTemplates = allTemplates?.filter((template) => {
    const matchesSearch =
      searchQuery === "" ||
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))

    const matchesCategory = !selectedCategory || template.category === selectedCategory

    return matchesSearch && matchesCategory
  })

  const categories = [
    { id: "customer-support", label: "Customer Support" },
    { id: "data-analysis", label: "Data Analysis" },
    { id: "content-creation", label: "Content Creation" },
    { id: "automation", label: "Automation" },
    { id: "research", label: "Research" },
  ]

  const handleUseTemplate = async (templateId: string, templateName: string) => {
    try {
      const response = await fetch(`/api/templates/${templateId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: `${templateName} (Copy)` }),
      })

      const workflow = await response.json()
      router.push(`/builder?workflow=${workflow.id}`)
    } catch (error) {
      console.error("Failed to use template:", error)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border/80 bg-card/60">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <h1 className="text-3xl font-bold mb-2">Workflow Templates</h1>
          <p className="text-muted-foreground">Start with pre-built workflows and customize them for your needs</p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="flex gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          <Button
            variant={selectedCategory === null ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory(null)}
          >
            All
          </Button>
          {categories.map((category) => {
            const Icon = categoryIcons[category.id]
            return (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category.id)}
                className="gap-2"
              >
                <Icon className="h-4 w-4" />
                {category.label}
              </Button>
            )
          })}
        </div>

        {/* Popular Templates */}
        {!searchQuery && !selectedCategory && (
          <div className="mb-12">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-semibold">Popular Templates</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {popularTemplates?.map((template) => {
                const Icon = categoryIcons[template.category]
                return (
                  <div
                    key={template.id}
                    className="group rounded-xl border border-border/80 bg-card p-6 transition-colors hover:border-primary/40"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className={cn("p-3 rounded-lg", categoryColors[template.category])}>
                        <Icon className="h-6 w-6" />
                      </div>
                      <span className="text-xs text-muted-foreground">{template.usageCount} uses</span>
                    </div>
                    <h3 className="font-semibold mb-2">{template.name}</h3>
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{template.description}</p>
                    <div className="mb-4 flex flex-wrap gap-1.5">
                      {template.tags.slice(0, 3).map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-[11px]">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    <Button
                    className="w-full bg-transparent group-hover:border-primary/60"
                      variant="outline"
                      onClick={() => handleUseTemplate(template.id, template.name)}
                    >
                      Use Template
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* All Templates */}
        <div>
          <h2 className="text-xl font-semibold mb-4">
            {searchQuery || selectedCategory ? "Search Results" : "All Templates"}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTemplates?.map((template) => {
              const Icon = categoryIcons[template.category]
              return (
                <div
                  key={template.id}
                  className="group rounded-xl border border-border/80 bg-card p-6 transition-colors hover:border-primary/40"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className={cn("p-3 rounded-lg", categoryColors[template.category])}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <span className="text-xs text-muted-foreground">{template.usageCount} uses</span>
                  </div>
                  <h3 className="font-semibold mb-2">{template.name}</h3>
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{template.description}</p>
                  <div className="mb-4 flex flex-wrap gap-1.5">
                    {template.tags.slice(0, 3).map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-[11px]">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  <Button
                    className="w-full bg-transparent"
                    variant="outline"
                    onClick={() => handleUseTemplate(template.id, template.name)}
                  >
                    Use Template
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              )
            })}
          </div>

          {filteredTemplates?.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">No templates found matching your criteria.</div>
          )}
        </div>
      </div>
    </div>
  )
}
