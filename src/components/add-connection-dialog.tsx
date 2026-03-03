"use client"

import type React from "react"

import { useState } from "react"
import type { Connector } from "@/lib/connector-types"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, ExternalLink } from "lucide-react"

interface AddConnectionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  connector: Connector
  onSuccess: () => void
}

export function AddConnectionDialog({ open, onOpenChange, connector, onSuccess }: AddConnectionDialogProps) {
  const [name, setName] = useState(`${connector.name} Connection`)
  const [apiKey, setApiKey] = useState("")
  const [loading, setLoading] = useState(false)

  const handleOAuthConnect = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/oauth/authorize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ connectorId: connector.id }),
      })

      const data = await res.json()

      if (data.authUrl) {
        // Redirect to OAuth provider
        window.location.href = data.authUrl
      }
    } catch (error) {
      console.error("Failed to initiate OAuth:", error)
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (connector.authType === "oauth2") {
      handleOAuthConnect()
      return
    }

    setLoading(true)

    try {
      const connection = {
        connectorId: connector.id,
        name,
        status: "connected" as const,
        config: {
          authType: connector.authType,
          credentials: {
            apiKey: apiKey,
          },
        },
      }

      const res = await fetch("/api/connections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(connection),
      })

      if (res.ok) {
        onSuccess()
        setName(`${connector.name} Connection`)
        setApiKey("")
      }
    } catch (error) {
      console.error("Failed to add connection:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Connect to {connector.name}</DialogTitle>
          <DialogDescription>{connector.description}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Connection Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="My Connection"
                required
              />
            </div>

            {connector.authType === "api_key" && (
              <div className="space-y-2">
                <Label htmlFor="apiKey">API Key</Label>
                <Input
                  id="apiKey"
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="sk-..."
                  required
                />
              </div>
            )}

            {connector.authType === "oauth2" && (
              <div className="p-4 rounded-lg bg-muted space-y-3">
                <div className="flex items-center gap-2">
                  <ExternalLink className="w-4 h-4 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    You'll be redirected to {connector.name} to authorize access.
                  </p>
                </div>
                <div className="text-xs text-muted-foreground space-y-1">
                  <p>This will grant AgentKit permission to:</p>
                  <ul className="list-disc list-inside pl-2">
                    <li>Read your data</li>
                    <li>Write to your account</li>
                    <li>Access on your behalf</li>
                  </ul>
                </div>
              </div>
            )}

            {connector.authType === "mcp" && (
              <div className="space-y-2">
                <Label htmlFor="serverUrl">MCP Server URL</Label>
                <Input
                  id="serverUrl"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="http://localhost:3000"
                  required
                />
              </div>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {connector.authType === "oauth2" ? "Authorize" : "Connect"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
