"use client"

import type React from "react"
import { useState } from "react"
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2 } from "lucide-react"

interface AddMCPServerDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAdd: (config: { name: string; url: string; protocol: "stdio" | "http" }) => void
  loading: boolean
}

export function AddMCPServerDialog({ open, onOpenChange, onAdd, loading }: AddMCPServerDialogProps) {
  const [name, setName] = useState("")
  const [url, setUrl] = useState("")
  const [protocol, setProtocol] = useState<"stdio" | "http">("http")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onAdd({ name, url, protocol })
    setName("")
    setUrl("")
    setProtocol("http")
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add MCP Server</DialogTitle>
          <DialogDescription>
            Connect a new Model Context Protocol server to extend your agent capabilities
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Server Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="My MCP Server"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="url">Server URL or Command</Label>
              <Input
                id="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="http://localhost:3000 or npx @modelcontextprotocol/server-filesystem"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="protocol">Protocol</Label>
              <Select value={protocol} onValueChange={(v) => setProtocol(v as "stdio" | "http")}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="http">HTTP</SelectItem>
                  <SelectItem value="stdio">STDIO</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Connect Server
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
