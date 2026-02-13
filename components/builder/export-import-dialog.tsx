"use client"

import { useState } from "react"
import { Download, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"

interface ExportImportDialogProps {
  workflowId: string
  onImportSuccess: () => void
}

export function ExportImportDialog({ workflowId, onImportSuccess }: ExportImportDialogProps) {
  const [showExport, setShowExport] = useState(false)
  const [showImport, setShowImport] = useState(false)
  const [importData, setImportData] = useState("")
  const { toast } = useToast()

  const handleExport = async () => {
    const response = await fetch(`/api/workflows/${workflowId}/export`)
    if (response.ok) {
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download =
        response.headers.get("Content-Disposition")?.split("filename=")[1]?.replace(/"/g, "") || "workflow.json"
      a.click()
      window.URL.revokeObjectURL(url)
      toast({ title: "Workflow exported successfully" })
    } else {
      toast({ title: "Failed to export workflow", variant: "destructive" })
    }
  }

  const handleImport = async () => {
    const response = await fetch("/api/workflows/import", {
      method: "POST",
      body: importData,
    })

    if (response.ok) {
      toast({ title: "Workflow imported successfully" })
      setShowImport(false)
      setImportData("")
      onImportSuccess()
    } else {
      toast({ title: "Failed to import workflow", variant: "destructive" })
    }
  }

  return (
    <>
      <Button variant="ghost" size="sm" className="h-8 gap-2" onClick={handleExport}>
        <Download className="h-3.5 w-3.5" />
        Export
      </Button>
      <Button variant="ghost" size="sm" className="h-8 gap-2" onClick={() => setShowImport(true)}>
        <Upload className="h-3.5 w-3.5" />
        Import
      </Button>

      <Dialog open={showImport} onOpenChange={setShowImport}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Import Workflow</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              placeholder="Paste your workflow JSON here..."
              className="min-h-[300px] font-mono text-sm"
              value={importData}
              onChange={(e) => setImportData(e.target.value)}
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowImport(false)}>
                Cancel
              </Button>
              <Button onClick={handleImport}>Import</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
