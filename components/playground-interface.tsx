"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useSearchParams } from "next/navigation"
import { useChat } from "@ai-sdk/react"
import { DefaultChatTransport } from "ai"
import { Bot, Send, Square, Settings2, ChevronRight, Loader2, CheckCircle2, XCircle, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { cn } from "@/lib/utils"
import type { Agent } from "@/lib/types"
import Markdown from "react-markdown"

interface ToolExecution {
  id: string
  name: string
  input: Record<string, unknown>
  output?: unknown
  status: "pending" | "executing" | "completed" | "failed"
  startedAt: Date
  completedAt?: Date
}

export function PlaygroundInterface() {
  const searchParams = useSearchParams()
  const [agents, setAgents] = useState<Agent[]>([])
  const [selectedAgentId, setSelectedAgentId] = useState<string>("")
  const [toolExecutions, setToolExecutions] = useState<ToolExecution[]>([])
  const [showConfig, setShowConfig] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const selectedAgent = agents.find((a) => a.id === selectedAgentId)

  const { messages, input, setInput, status, stop, handleSubmit, setMessages } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/playground/chat",
      body: { agentId: selectedAgentId },
    }),
    onToolCall: ({ toolCall }) => {
      const execution: ToolExecution = {
        id: toolCall.toolCallId,
        name: toolCall.toolName,
        input: toolCall.args as Record<string, unknown>,
        status: "executing",
        startedAt: new Date(),
      }
      setToolExecutions((prev) => [...prev, execution])
    },
  })

  // Update tool execution status based on message parts
  useEffect(() => {
    const lastMessage = messages[messages.length - 1]
    if (lastMessage?.role === "assistant" && lastMessage.parts) {
      lastMessage.parts.forEach((part: { type: string; toolCallId?: string; result?: unknown }) => {
        if (part.type.startsWith("tool-") && part.toolCallId) {
          setToolExecutions((prev) =>
            prev.map((exec) =>
              exec.id === part.toolCallId
                ? {
                    ...exec,
                    status: "completed",
                    output: part.result,
                    completedAt: new Date(),
                  }
                : exec,
            ),
          )
        }
      })
    }
  }, [messages])

  useEffect(() => {
    fetch("/api/agents")
      .then((res) => res.json())
      .then((data) => {
        setAgents(data)
        const agentParam = searchParams.get("agent")
        if (agentParam && data.some((a: Agent) => a.id === agentParam)) {
          setSelectedAgentId(agentParam)
        } else if (data.length > 0) {
          setSelectedAgentId(data[0].id)
        }
      })
      .catch(console.error)
  }, [searchParams])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleNewChat = () => {
    setMessages([])
    setToolExecutions([])
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      if (input?.trim() && status !== "streaming") {
        handleSubmit(e as unknown as React.FormEvent)
      }
    }
  }

  return (
    <div className="flex h-full">
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-4">
            <Select value={selectedAgentId} onValueChange={setSelectedAgentId}>
              <SelectTrigger className="w-64">
                <SelectValue placeholder="Select an agent" />
              </SelectTrigger>
              <SelectContent>
                {agents.map((agent) => (
                  <SelectItem key={agent.id} value={agent.id}>
                    <div className="flex items-center gap-2">
                      <Bot className="w-4 h-4" />
                      {agent.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedAgent && (
              <div className="flex items-center gap-2">
                <Badge variant="outline">{selectedAgent.model}</Badge>
                <Badge variant="secondary">{selectedAgent.tools.length} tools</Badge>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleNewChat}>
              New Chat
            </Button>
            <Button variant="ghost" size="icon" onClick={() => setShowConfig(!showConfig)}>
              <Settings2 className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 p-4">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                <Bot className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Start a conversation</h3>
              <p className="text-muted-foreground max-w-md">
                {selectedAgent
                  ? `Chat with ${selectedAgent.name}. This agent has access to ${selectedAgent.tools.length} tools.`
                  : "Select an agent to start chatting"}
              </p>
            </div>
          ) : (
            <div className="space-y-4 max-w-3xl mx-auto">
              {messages.map((message) => (
                <div key={message.id} className={cn("flex gap-3", message.role === "user" && "justify-end")}>
                  {message.role === "assistant" && (
                    <div className="flex items-start justify-center w-8 h-8 rounded-full bg-primary/10 shrink-0">
                      <Bot className="w-4 h-4 text-primary mt-2" />
                    </div>
                  )}
                  <div
                    className={cn(
                      "rounded-lg px-4 py-3 max-w-[80%]",
                      message.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted",
                    )}
                  >
                    {message.parts ? (
                      <div className="space-y-2">
                        {message.parts.map(
                          (
                            part: { type: string; text?: string; toolName?: string; args?: unknown; result?: unknown },
                            idx: number,
                          ) => {
                            if (part.type === "text" && part.text) {
                              return (
                                <div key={idx} className="prose prose-sm dark:prose-invert max-w-none">
                                  <Markdown>{part.text}</Markdown>
                                </div>
                              )
                            }
                            if (part.type.startsWith("tool-")) {
                              return (
                                <div key={idx} className="mt-2 p-2 rounded bg-background/50 border border-border">
                                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <Badge variant="outline" className="text-xs">
                                      {part.toolName}
                                    </Badge>
                                    {part.result ? (
                                      <CheckCircle2 className="w-3 h-3 text-green-500" />
                                    ) : (
                                      <Loader2 className="w-3 h-3 animate-spin" />
                                    )}
                                  </div>
                                </div>
                              )
                            }
                            return null
                          },
                        )}
                      </div>
                    ) : (
                      <div className="prose prose-sm dark:prose-invert max-w-none">
                        <Markdown>{message.content}</Markdown>
                      </div>
                    )}
                  </div>
                  {message.role === "user" && (
                    <div className="flex items-start justify-center w-8 h-8 rounded-full bg-primary shrink-0">
                      <span className="text-primary-foreground text-sm font-medium mt-1.5">U</span>
                    </div>
                  )}
                </div>
              ))}
              {status === "streaming" && (
                <div className="flex gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 shrink-0">
                    <Loader2 className="w-4 h-4 text-primary animate-spin" />
                  </div>
                  <div className="rounded-lg px-4 py-3 bg-muted">
                    <span className="text-muted-foreground">Thinking...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </ScrollArea>

        {/* Input */}
        <div className="p-4 border-t border-border">
          <form onSubmit={handleSubmit} className="max-w-3xl mx-auto">
            <div className="relative">
              <Textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={selectedAgent ? `Message ${selectedAgent.name}...` : "Select an agent first..."}
                disabled={!selectedAgentId || status === "streaming"}
                className="min-h-[60px] max-h-[200px] pr-24 resize-none"
                rows={1}
              />
              <div className="absolute right-2 bottom-2 flex gap-2">
                {status === "streaming" ? (
                  <Button type="button" size="icon" variant="ghost" onClick={stop}>
                    <Square className="w-4 h-4" />
                  </Button>
                ) : (
                  <Button type="submit" size="icon" disabled={!input?.trim() || !selectedAgentId}>
                    <Send className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Tool Execution Panel */}
      <div
        className={cn(
          "border-l border-border bg-card transition-all duration-300",
          showConfig ? "w-80" : "w-0 overflow-hidden",
        )}
      >
        {showConfig && (
          <div className="p-4 h-full flex flex-col">
            <h3 className="font-semibold mb-4">Tool Executions</h3>
            <ScrollArea className="flex-1">
              {toolExecutions.length === 0 ? (
                <p className="text-sm text-muted-foreground">No tool calls yet</p>
              ) : (
                <div className="space-y-3">
                  {toolExecutions.map((execution) => (
                    <Collapsible key={execution.id}>
                      <Card>
                        <CollapsibleTrigger asChild>
                          <CardHeader className="p-3 cursor-pointer hover:bg-accent/50 transition-colors">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                {execution.status === "executing" && (
                                  <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                                )}
                                {execution.status === "completed" && (
                                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                                )}
                                {execution.status === "failed" && <XCircle className="w-4 h-4 text-red-500" />}
                                <CardTitle className="text-sm">{execution.name}</CardTitle>
                              </div>
                              <ChevronRight className="w-4 h-4 text-muted-foreground" />
                            </div>
                          </CardHeader>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <CardContent className="p-3 pt-0 space-y-2">
                            <div>
                              <p className="text-xs text-muted-foreground mb-1">Input</p>
                              <pre className="text-xs bg-muted p-2 rounded overflow-auto max-h-24">
                                {JSON.stringify(execution.input, null, 2)}
                              </pre>
                            </div>
                            {execution.output && (
                              <div>
                                <p className="text-xs text-muted-foreground mb-1">Output</p>
                                <pre className="text-xs bg-muted p-2 rounded overflow-auto max-h-24">
                                  {JSON.stringify(execution.output, null, 2)}
                                </pre>
                              </div>
                            )}
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <Clock className="w-3 h-3" />
                              {execution.completedAt
                                ? `${execution.completedAt.getTime() - execution.startedAt.getTime()}ms`
                                : "Running..."}
                            </div>
                          </CardContent>
                        </CollapsibleContent>
                      </Card>
                    </Collapsible>
                  ))}
                </div>
              )}
            </ScrollArea>

            {selectedAgent && (
              <div className="mt-4 pt-4 border-t border-border">
                <h4 className="text-sm font-medium mb-2">Agent Config</h4>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Model:</span> {selectedAgent.model}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Tools:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {selectedAgent.tools.map((tool) => (
                        <Badge key={tool} variant="secondary" className="text-xs">
                          {tool}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
