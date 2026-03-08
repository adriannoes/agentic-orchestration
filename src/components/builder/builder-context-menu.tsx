"use client"

/**
 * Pane and node context menus use DropdownMenu (not Radix ContextMenu) because
 * we need controlled open/onOpenChange to position the menu at click coordinates
 * (clientX/clientY). Radix ContextMenu in this version does not support controlled
 * mode; using it caused a runtime TDZ error. Menus are closed on window resize/scroll
 * from builder-canvas to avoid orphaned overlays.
 */
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Copy,
  Layers,
  Trash2,
  MessageSquare,
  ClipboardPaste,
  ArrowDownUp,
  Frame,
  CornerDownLeft,
} from "lucide-react"
import type { WorkflowNode } from "@/lib/workflow-types"

const MENU_CONTENT = "border border-border/80 bg-popover text-popover-foreground shadow-none"

export interface NodeContextMenuProps {
  onDuplicate: () => void
  onCopy: () => void
  onDelete: () => void
  onAssignToFrame?: (nodeId: string, frameId: string) => void
  onRemoveFromFrame?: (nodeId: string) => void
  frames?: WorkflowNode[]
  nodeId: string
  nodeType?: string
  parentId?: string
  children: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function NodeContextMenu({
  onDuplicate,
  onCopy,
  onDelete,
  onAssignToFrame,
  onRemoveFromFrame,
  frames = [],
  nodeId,
  nodeType,
  parentId,
  children,
  open,
  onOpenChange,
}: NodeContextMenuProps) {
  const availableFrames = frames.filter((f) => f.type === "frame")
  const canAddToFrame = nodeType !== "frame" && availableFrames.length > 0 && onAssignToFrame
  const canRemoveFromFrame = nodeType !== "frame" && parentId && onRemoveFromFrame

  return (
    <DropdownMenu open={open} onOpenChange={onOpenChange}>
      <DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>
      <DropdownMenuContent className={MENU_CONTENT} side="right" align="start">
        <DropdownMenuItem onSelect={onDuplicate}>
          <Layers className="h-4 w-4" />
          Duplicate
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={onCopy}>
          <Copy className="h-4 w-4" />
          Copy
        </DropdownMenuItem>
        {canAddToFrame && (
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <Frame className="h-4 w-4" />
              Add to frame
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent className={MENU_CONTENT}>
              {availableFrames.map((frame) => (
                <DropdownMenuItem key={frame.id} onSelect={() => onAssignToFrame(nodeId, frame.id)}>
                  {frame.data?.label ?? "Frame"}
                </DropdownMenuItem>
              ))}
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        )}
        {canRemoveFromFrame && (
          <DropdownMenuItem onSelect={() => onRemoveFromFrame(nodeId)}>
            <CornerDownLeft className="h-4 w-4" />
            Remove from frame
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={onDelete} variant="destructive">
          <Trash2 className="h-4 w-4" />
          Delete
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem disabled>
          <MessageSquare className="h-4 w-4 opacity-50" />
          Add Comment
          <span className="text-muted-foreground ml-auto text-[10px]">Coming soon</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export interface PaneContextMenuProps {
  onPaste: () => void
  onAutoLayout: () => void
  onAddFrame?: () => void
  children: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function PaneContextMenu({
  onPaste,
  onAutoLayout,
  onAddFrame,
  children,
  open,
  onOpenChange,
}: PaneContextMenuProps) {
  return (
    <DropdownMenu open={open} onOpenChange={onOpenChange}>
      <DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>
      <DropdownMenuContent className={MENU_CONTENT} side="right" align="start">
        <DropdownMenuItem onSelect={onPaste}>
          <ClipboardPaste className="h-4 w-4" />
          Paste
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={onAutoLayout}>
          <ArrowDownUp className="h-4 w-4" />
          Auto Layout
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={onAddFrame}>
          <Frame className="h-4 w-4" />
          Add Frame
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
