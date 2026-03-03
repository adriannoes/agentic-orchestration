"use client"

import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandShortcut,
  CommandSeparator,
} from "@/components/ui/command"
import type { NodeType } from "@/lib/workflow-types"

export interface BuilderCommandPaletteProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: () => void
  onUndo: () => void
  onRedo: () => void
  onAutoLayout: () => void
  onZoomIn: () => void
  onZoomOut: () => void
  onFitView: () => void
  onAddNode: (type: NodeType) => void
  onAddFrame?: () => void
  canUndo?: boolean
  canRedo?: boolean
}

const NODE_TYPES: { type: NodeType; label: string }[] = [
  { type: "agent", label: "Agent" },
  { type: "start", label: "Start" },
  { type: "end", label: "End" },
  { type: "guardrail", label: "Guardrail" },
  { type: "condition", label: "Condition" },
  { type: "mcp", label: "MCP Server" },
  { type: "user-approval", label: "User Approval" },
  { type: "file-search", label: "File Search" },
]

export function BuilderCommandPalette({
  open,
  onOpenChange,
  onSave,
  onUndo,
  onRedo,
  onAutoLayout,
  onZoomIn,
  onZoomOut,
  onFitView,
  onAddNode,
  onAddFrame,
  canUndo = true,
  canRedo = true,
}: BuilderCommandPaletteProps) {
  const runAndClose = (fn: () => void) => {
    fn()
    onOpenChange(false)
  }

  return (
    <CommandDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Command Palette"
      description="Search for a command to run..."
    >
      <CommandInput placeholder="Search commands..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>

        <CommandGroup heading="Actions">
          <CommandItem onSelect={() => runAndClose(onSave)}>
            Save
            <CommandShortcut>⌘S</CommandShortcut>
          </CommandItem>
          <CommandItem onSelect={() => runAndClose(onUndo)} disabled={!canUndo}>
            Undo
            <CommandShortcut>⌘Z</CommandShortcut>
          </CommandItem>
          <CommandItem onSelect={() => runAndClose(onRedo)} disabled={!canRedo}>
            Redo
            <CommandShortcut>⌘⇧Z</CommandShortcut>
          </CommandItem>
          <CommandItem onSelect={() => runAndClose(onAutoLayout)}>
            Auto Layout
            <CommandShortcut>⌘⇧L</CommandShortcut>
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Navigation">
          <CommandItem onSelect={() => runAndClose(onZoomIn)}>
            Zoom In
            <CommandShortcut>⌘+</CommandShortcut>
          </CommandItem>
          <CommandItem onSelect={() => runAndClose(onZoomOut)}>
            Zoom Out
            <CommandShortcut>⌘-</CommandShortcut>
          </CommandItem>
          <CommandItem onSelect={() => runAndClose(onFitView)}>
            Fit View
            <CommandShortcut>⌘0</CommandShortcut>
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Add Node">
          {onAddFrame && (
            <CommandItem onSelect={() => runAndClose(onAddFrame)}>
              Add Frame
            </CommandItem>
          )}
          {NODE_TYPES.filter(({ type }) => type !== "frame").map(({ type, label }) => (
            <CommandItem key={type} onSelect={() => runAndClose(() => onAddNode(type))}>
              Add {label}
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  )
}
