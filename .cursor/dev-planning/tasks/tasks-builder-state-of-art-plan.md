# Task List: Builder State-of-the-Art Evolution

**Source PRD**: `.cursor/product-specs/builder-state-of-art-plan.md`  
**Branch**: `feature/builder-state-of-art`  
**Generated**: 2025-03-02

---

## Relevant Files

- `src/components/builder/builder-command-palette.tsx` - Command Palette (CMD+K) component.
- `src/components/builder/builder-context-menu.tsx` - NodeContextMenu and PaneContextMenu with glassmorphic styling.
- `src/components/builder/node-sidebar.tsx` - Drag-and-drop from sidebar to canvas.
- `src/components/builder/builder-canvas.tsx` - Integrates palette, context menu, drop handler, edge types, layout transition.
- `src/components/builder/edges/animated-flow-edge.tsx` - Custom edge with dash animation when running.
- `src/components/builder/edges/gradient-edge.tsx` - Custom edge with source-to-target gradient.
- `src/components/builder/edges/index.ts` - Edge types export.
- `src/lib/builder/workflow-to-reactflow.ts` - Edge type, data (sourceColor, targetColor, isRunning), runningEdgeIds.
- `src/lib/workflow-types.ts` - NODE_COLORS_HEX, frame type, parentId, style.
- `src/components/builder/frame-node.tsx` - Frame node with editable label.
- `src/app/globals.css` - animate-flow-dash keyframe for edge animation.
- `src/components/ui/command.tsx` - Existing cmdk/Command primitives (reference).
- `src/components/ui/context-menu.tsx` - Radix Context Menu primitives (reference).
- `e2e/builder.spec.ts` - E2E tests for builder.
- `tests/` - Unit tests (Vitest; mirror src structure if applicable).

### Notes

- This project uses Vitest and Playwright. Use `npm run test` / `npm run test:e2e` for verification.
- Frontend stack: Next.js 16, React 19, Tailwind v4, @xyflow/react v12.

---

## Tasks

### 1.0 Command Palette (CMD+K) & Shortcuts Visibility ✅

**Trigger:** User presses `Cmd+K` (Mac) or `Ctrl+K` (Win) or `?` in the builder.  
**Enables:** Quick access to all builder actions without memorizing shortcuts; replaces fixed shortcuts panel.  
**Depends on:** Existing `cmdk` and `Command`/`CommandDialog` in `src/components/ui/command.tsx`.

**Acceptance Criteria:**

- [x] CMD+K / Ctrl+K opens a styled command palette overlay.
- [x] Palette includes groups: Actions (Save, Undo, Redo, Auto Layout), Navigation (Zoom In/Out, Fit View), Add Node (Agent, Start, End, etc.).
- [x] Each command shows its keyboard shortcut (e.g. Ctrl+S, Ctrl+Z).
- [x] Selecting a command executes the corresponding action.
- [x] Fixed shortcuts panel in bottom-right is removed or minimized.
- [x] `?` opens the same palette or a shortcuts help view.

---

- [x] 1.1 Create `BuilderCommandPalette` component
  - **File**: `src/components/builder/builder-command-palette.tsx` (create new)
  - **What**: Create a client component that uses `CommandDialog`, `CommandInput`, `CommandList`, `CommandGroup`, `CommandItem`, `CommandShortcut` from `@/components/ui/command`. Accept props: `open`, `onOpenChange`, and handler callbacks for each action (onSave, onUndo, onRedo, onAutoLayout, onZoomIn, onZoomOut, onFitView, onAddNode).
  - **Why**: Centralizes all builder actions in a searchable palette; enables CMD+K UX.
  - **Pattern**: Follow `src/components/ui/command.tsx` usage; use `CommandDialog` with controlled `open` state.
  - **Verify**: Component renders without errors; `npm run build` passes.

- [x] 1.2 Wire palette to builder handlers and keyboard shortcut
  - **File**: `src/components/builder/builder-canvas.tsx` (modify existing)
  - **What**: Add `useState` for `commandPaletteOpen`; add `useEffect` to listen for `keydown` on `Cmd+K` / `Ctrl+K` and `?`, set `commandPaletteOpen(true)`. Render `BuilderCommandPalette` with all handler props (handleSaveVersion, handleUndo, handleRedo, handleAutoLayout, handleZoomIn, handleZoomOut, handleResetView, handleAddNode). Ensure handlers close the palette after execution.
  - **Why**: Connects the palette to actual builder logic.
  - **Pattern**: Reuse existing handlers from builder-canvas (lines 277–388).
  - **Verify**: Press CMD+K in builder, palette opens; select "Save", action runs and palette closes.

- [x] 1.3 Add command groups and items with shortcuts
  - **File**: `src/components/builder/builder-command-palette.tsx` (modify existing)
  - **What**: Implement groups: "Actions" (Save, Undo, Redo, Auto Layout), "Navigation" (Zoom In, Zoom Out, Fit View), "Add Node" (Agent, Start, End, Guardrail, Condition, MCP, User Approval, File Search). Each item shows `CommandShortcut` with the correct key (e.g. `⌘S`, `⌘Z`, `⌘⇧L`). Use `CommandEmpty` for "No results". Disable Undo/Redo when `!canUndo` / `!canRedo`.
  - **Why**: Users can discover and execute actions via search or keyboard.
  - **Pattern**: `CommandGroup` with `heading`; `CommandItem` with `onSelect`; `CommandShortcut` for keys.
  - **Verify**: Search "save" shows Save; select "Add Agent" adds an agent node; shortcuts display correctly.

- [x] 1.4 Remove or minimize fixed shortcuts panel
  - **File**: `src/components/builder/builder-canvas.tsx` (modify existing)
  - **What**: Remove the `div` with "Keyboard Shortcuts" (lines 599–631) or replace with a small "?" button that opens the command palette. If keeping a minimal hint, show only "⌘K" to open commands.
  - **Why**: Reduces clutter; CMD+K becomes the primary shortcut discovery.
  - **Pattern**: Replace block with `<Button variant="ghost" size="sm" onClick={() => setCommandPaletteOpen(true)}>⌘K</Button>` or similar.
  - **Verify**: Bottom-right no longer shows full shortcuts list; CMD+K still works.

---

### 2.0 Custom Context Menu (Right-Click) ✅

**Trigger:** User right-clicks on a node or on the canvas background (pane).  
**Enables:** Quick actions (Duplicate, Copy, Delete, etc.) without toolbar or keyboard.  
**Depends on:** `@radix-ui/react-context-menu` (already installed).

**Acceptance Criteria:**

- [x] Right-click on a node opens a context menu with: Duplicate, Copy, Delete, Add Comment (placeholder).
- [x] Right-click on pane (background) opens a context menu with: Paste, Auto Layout, Add Frame (placeholder if Task 5 not done).
- [x] Menu is styled consistently with the builder (glassmorphic/minimal).
- [x] Actions execute correctly (e.g. Duplicate creates a copy, Delete removes the node).

---

- [x] 2.1 Create `BuilderContextMenu` for node actions
  - **File**: `src/components/builder/builder-context-menu.tsx` (create new)
  - **What**: Create a component that wraps `ContextMenu`, `ContextMenuTrigger`, `ContextMenuContent`, `ContextMenuItem` from `@/components/ui/context-menu`. Export `NodeContextMenu` that wraps children and shows menu items: Duplicate, Copy, Delete, Add Comment (disabled/placeholder). Accept props: `onDuplicate`, `onCopy`, `onDelete`, and `children` (the trigger area).
  - **Why**: Enables right-click actions on nodes.
  - **Pattern**: Follow `src/components/ui/context-menu.tsx`; use `ContextMenuTrigger` with `asChild` wrapping the node.
  - **Verify**: Right-click on a node shows menu; Duplicate/Copy/Delete call the correct handlers.

- [x] 2.2 Create pane (background) context menu
  - **File**: `src/components/builder/builder-context-menu.tsx` (modify existing)
  - **What**: Export `PaneContextMenu` that wraps the ReactFlow pane (or a div covering the canvas). Menu items: Paste, Auto Layout, Add Frame (disabled with "Coming soon" or similar). Accept props: `onPaste`, `onAutoLayout`, `onAddFrame` (optional).
  - **Why**: Enables right-click actions on empty canvas.
  - **Pattern**: Same as NodeContextMenu; use `ContextMenuTrigger` around the pane.
  - **Verify**: Right-click on canvas background shows Paste, Auto Layout; Paste works when clipboard has nodes.

- [x] 2.3 Integrate context menus into builder canvas
  - **File**: `src/components/builder/builder-canvas.tsx` (modify existing)
  - **What**: Wrap the ReactFlow component (or its parent) with `PaneContextMenu` and pass `onPaste`, `onAutoLayout`. For nodes: ReactFlow's `nodes` are rendered by `CanvasNode`; we need to wrap each node or use ReactFlow's `onNodeContextMenu` to show a custom menu. Option A: Use `onNodeContextMenu` + a floating menu positioned at event coordinates. Option B: Wrap `CanvasNode` with `NodeContextMenu` in a custom node wrapper. Prefer Option A for simplicity—create a single context menu that opens on node right-click, positioned at cursor, with node ID in state.
  - **Why**: Connects context menus to builder state and handlers.
  - **Pattern**: Use `onPaneContextMenu` and `onNodeContextMenu` from ReactFlow if available; otherwise wrap pane and pass node context via state.
  - **Integration**: Context menu actions call `handleDuplicate`, `handleCopy`, `handleNodeDelete`, `handlePaste`, `handleAutoLayout` from builder-canvas.
  - **Verify**: Right-click node → Duplicate creates copy; right-click pane → Paste pastes from clipboard.

- [x] 2.4 Apply glassmorphic styling to context menus
  - **File**: `src/components/builder/builder-context-menu.tsx` (modify existing)
  - **What**: Override `ContextMenuContent` className to add `bg-card/95 backdrop-blur-xl border-white/10` (or similar) to match builder aesthetic. Ensure `ContextMenuItem` has hover states consistent with builder.
  - **Why**: Visual consistency with the builder's minimal/glassmorphic design.
  - **Pattern**: Follow `builder-canvas.tsx` toolbar styling (`bg-background/60 backdrop-blur-2xl border-white/10`).
  - **Verify**: Context menu matches builder visual style.

---

### 3.0 Drag Sidebar → Canvas ✅

**Trigger:** User drags a node type from the sidebar and drops it on the canvas.  
**Enables:** Precise node placement instead of center-drop; Figma/Linear-style UX.  
**Depends on:** None (HTML5 Drag and Drop API).

**Acceptance Criteria:**

- [x] Node types in the sidebar are draggable (`draggable={true}`).
- [x] Dragging shows a ghost/drag preview (custom or default).
- [x] Dropping on the canvas creates the node at the exact drop position (converted via `screenToFlowPosition`).
- [x] Click-to-add (current behavior) remains as fallback.
- [x] New nodes snap to grid (20px).

---

- [x] 3.1 Make sidebar node buttons draggable
  - **File**: `src/components/builder/node-sidebar.tsx` (modify existing)
  - **What**: Add `draggable={true}` to each node `<button>`. Add `onDragStart` that calls `e.dataTransfer.setData('application/json', JSON.stringify({ type: node.type, label: node.label }))` and `e.dataTransfer.effectAllowed = 'move'`. Optionally use `e.dataTransfer.setDragImage()` with a cloned/styled element for custom ghost.
  - **Why**: Enables drag source for drop target on canvas.
  - **Pattern**: HTML5 Drag and Drop; ensure `setData` uses a unique MIME type or `application/json`.
  - **Verify**: Dragging a node from sidebar shows drag cursor; `dataTransfer` contains type and label.

- [x] 3.2 Extend `handleAddNode` to accept optional position
  - **File**: `src/components/builder/builder-canvas.tsx` (modify existing)
  - **What**: Change `handleAddNode` signature to `handleAddNode(type: NodeType, position?: Position)`. When `position` is provided, use it (snapped to GRID_SIZE); otherwise use current center logic. Apply same overlap-avoidance logic when using custom position.
  - **Why**: Enables drop handler to pass exact drop coordinates.
  - **Pattern**: Follow existing `handleAddNode` (lines 226–272); add optional second param.
  - **Integration**: Called by drop handler with `screenToFlowPosition` result.
  - **Verify**: `handleAddNode('agent', { x: 100, y: 200 })` creates node at (100, 200) snapped to grid.

- [x] 3.3 Add drop handler to canvas wrapper
  - **File**: `src/components/builder/builder-canvas.tsx` (modify existing)
  - **What**: Add `onDragOver` and `onDrop` to the div that wraps ReactFlow (the one with `data-testid="builder-canvas"` or the flex-1 canvas container). In `onDragOver`: `e.preventDefault()`, `e.dataTransfer.dropEffect = 'move'`. In `onDrop`: `e.preventDefault()`, parse `e.dataTransfer.getData('application/json')` to get `{ type, label }`, call `screenToFlowPosition({ x: e.clientX, y: e.clientY })`, snap to GRID_SIZE, then `handleAddNode(type, position)`.
  - **Why**: Completes drag-and-drop flow from sidebar to canvas.
  - **Pattern**: HTML5 drop; ensure drop target is the same element that contains the ReactFlow viewport.
  - **Verify**: Drag Agent from sidebar, drop on canvas; node appears at drop position.

- [x] 3.4 Update `NodeSidebar` props to support drag
  - **File**: `src/components/builder/node-sidebar.tsx` (modify existing)
  - **What**: Ensure `onAddNode` is still called on `onClick` (fallback). No prop changes needed if we only add `draggable` and `onDragStart`; click continues to call `onAddNode(node.type)` without position. Document that click adds at center, drag adds at drop position.
  - **Why**: Preserves backward compatibility.
  - **Verify**: Click still adds node at center; drag adds at drop position.

---

### 4.0 Animated Edges & Auto-Layout Spring ✅

**Trigger:** (Edges) Workflow execution highlights edges; (Layout) User clicks Auto Layout.  
**Enables:** Visual feedback during execution; smooth layout transitions instead of instant jump.  
**Depends on:** ReactFlow custom edges API; optional `framer-motion` for spring.

**Acceptance Criteria:**

- [x] Custom `GradientEdge`: edges render with gradient from source node color to target node color.
- [x] Custom `AnimatedFlowEdge`: when workflow is running, particles/circle animate along the edge path for active connections.
- [x] Edges use `getBezierPath` / `BaseEdge` and are registered in `edgeTypes`.
- [x] Auto Layout applies new positions with a smooth transition (spring or CSS) instead of instant jump.
- [x] `workflow-to-reactflow.ts` passes `type` and `data` (e.g. `isRunning`) to edges.

---

- [x] 4.1 Create `GradientEdge` custom edge component
  - **File**: `src/components/builder/edges/gradient-edge.tsx` (create new)
  - **What**: Create a React component that receives `EdgeProps` from ReactFlow. Use `getBezierPath` from `@xyflow/react` to get path. Render SVG with `linearGradient` (unique `id` per edge) from `sourceColor` to `targetColor`. Use `BaseEdge` with the path and `stroke="url(#gradient)"`. Accept `data.sourceColor` and `data.targetColor` (hex or Tailwind color values).
  - **Why**: Visual hierarchy: edges show flow from source to target by color.
  - **Pattern**: ReactFlow custom edges docs; use `getBezierPath`, `BaseEdge`; map node types to colors via `NODE_COLORS` from workflow-types.
  - **Verify**: Edge renders with gradient; no console errors.

- [x] 4.2 Create `AnimatedFlowEdge` for running state
  - **File**: `src/components/builder/edges/animated-flow-edge.tsx` (create new)
  - **What**: Create edge component that extends or composes `GradientEdge`. When `data.isRunning === true`, add SVG `<circle>` with `<animateMotion>` along the path, or use CSS `stroke-dasharray` + `@keyframes` for dash animation. Use `getBezierPath` for the path. Register as edge type `animatedFlow`.
  - **Why**: Indicates which connections are active during workflow execution.
  - **Pattern**: ReactFlow "Animating Edges" example; `animateMotion` or `stroke-dashoffset` animation.
  - **Verify**: When `isRunning` is true, edge shows animation; when false, static gradient.

- [x] 4.3 Export edge types and register in builder
  - **File**: `src/components/builder/edges/index.ts` (create new)
  - **What**: Export `edgeTypes` object: `{ gradient: GradientEdge, animatedFlow: AnimatedFlowEdge }`. In `builder-canvas.tsx`, pass `edgeTypes` to ReactFlow's `edgeTypes` prop.
  - **Why**: ReactFlow needs to know how to render each edge type.
  - **Pattern**: `nodeTypes` in builder-canvas; same pattern for edges.
  - **Verify**: Edges render with custom types; default edges fall back to gradient if no type specified.

- [x] 4.4 Update `workflow-to-reactflow` to pass edge type and data
  - **File**: `src/lib/builder/workflow-to-reactflow.ts` (modify existing)
  - **What**: In `workflowConnectionsToEdges`, add `type: 'gradient'` (or `animatedFlow` when `isRunning`) and `data: { sourceColor, targetColor, isRunning }`. Map source/target node types to colors using `NODE_COLORS` from workflow-types. `isRunning` must come from execution context—add optional param `runningEdgeIds?: string[]` to the converter, or pass via a separate mechanism (e.g. context in builder-canvas that provides `highlightedEdgeIds`).
  - **Why**: Edges receive color and running state for rendering.
  - **Pattern**: Extend `Edge` type with `type` and `data`; builder-canvas passes `highlightedNodeId`—add `highlightedEdgeIds` or derive from execution.
  - **Integration**: ExecutionMonitor or run state sets which edges are "active"; pass to workflow-to-reactflow or directly to edges via ReactFlow's `edges` with `data.isRunning`.
  - **Verify**: Edges show gradient; when execution highlights a path, those edges show animation.

- [x] 4.5 Add spring/transition to Auto Layout
  - **File**: `src/components/builder/builder-canvas.tsx` (modify existing)
  - **What**: When `handleAutoLayout` receives new node positions from API, instead of `setNodes` with final positions immediately, animate positions. Option A: Use CSS `transition: transform` on nodes—ReactFlow uses `transform` for position; add `transitionDuration` or `style` to nodes when positions change. Option B: Interpolate positions over ~400ms using `requestAnimationFrame` or `framer-motion`. Option C: Check if ReactFlow v12 has `nodesDraggable` + `transitionDuration` or similar. Prefer CSS: add `className` or `style` to nodes with `transition: transform 0.4s cubic-bezier(0.4,0,0.2,1)` when a "layout transition" flag is set.
  - **Why**: Smooth UX instead of jarring jump.
  - **Pattern**: ReactFlow may support `nodeOrigin`; otherwise animate via state updates in small steps.
  - **Verify**: Click Auto Layout; nodes slide smoothly to new positions.

---

### 5.0 Minimap & Frames (Organization) ✅

**Trigger:** (Minimap) User navigates large flows; (Frames) User creates a frame or groups nodes.  
**Enables:** Navigation in large workflows; visual grouping of sub-workflows.  
**Depends on:** ReactFlow `MiniMap`; ReactFlow Parent Nodes for frames.

**Acceptance Criteria:**

- [x] MiniMap appears in bottom-left corner with glassmorphic styling (`backdrop-blur`, `border-white/10`).
- [x] MiniMap allows pan/zoom navigation (click to jump).
- [x] Frame node type: glassmorphic rectangle that can contain child nodes (`parentId`).
- [x] UI to add a frame (button or lasso) and to assign nodes to a frame.
- [x] Frame has editable label (e.g. "Fase 1: Preparação de Dados").

---

- [x] 5.1 Add MiniMap to builder canvas
  - **File**: `src/components/builder/builder-canvas.tsx` (modify existing)
  - **What**: Import `MiniMap` from `@xyflow/react`. Add `<MiniMap className="!bottom-4 !left-4 !top-auto !right-auto rounded-lg border border-white/10 bg-card/40 backdrop-blur-xl" nodeColor="#fff" nodeStrokeColor="#fff" maskColor="rgba(0,0,0,0.6)" />` inside the ReactFlow component. Ensure it doesn't overlap with the command palette trigger or other UI. Position `absolute bottom-4 left-4`.
  - **Why**: Enables navigation in large workflows.
  - **Pattern**: ReactFlow MiniMap API; style with Tailwind.
  - **Verify**: MiniMap visible in bottom-left; click on minimap pans/zooms main view.

- [x] 5.2 Add `frame` node type to workflow types
  - **File**: `src/lib/workflow-types.ts` (modify existing)
  - **What**: Add `"frame"` to `NodeType` union. Add frame-specific fields to `NodeData` or create `FrameNodeData`: `label`, `width`, `height`. Ensure `WorkflowNode` supports `parentId?: string` for child nodes.
  - **Why**: Frames are a new node type that can contain other nodes.
  - **Pattern**: Follow existing node types; ReactFlow Parent Nodes require `parentId` on children.
  - **Verify**: TypeScript compiles; `frame` is a valid node type.

- [x] 5.3 Create `FrameNode` component
  - **File**: `src/components/builder/canvas-node.tsx` (modify existing) or `src/components/builder/frame-node.tsx` (create new)
  - **What**: Create a node component for type `frame`. Render a div with `position: absolute`, `width`, `height` from `data`, glassmorphic styling (`bg-white/5 backdrop-blur border border-white/10 rounded-lg`). Include an editable label (inline input or on double-click). No handles—frames are containers. Register in `nodeTypes` as `frame`.
  - **Why**: Renders the frame visually on the canvas.
  - **Pattern**: ReactFlow custom nodes; use `Handle` only if frame needs connection points; for pure grouping, no handles.
  - **Verify**: Frame node renders; label is editable.

- [x] 5.4 Implement add-frame and assign-nodes-to-frame logic
  - **File**: `src/components/builder/builder-canvas.tsx` (modify existing)
  - **What**: Add "Add Frame" to toolbar or context menu. When triggered, create a frame node with default size (e.g. 400x300) at center or near selection. Add API support: POST node with `type: 'frame'`, PATCH nodes to set `parentId` when assigning to frame. Add UI to "Add to frame" when nodes are selected (context menu or toolbar). Ensure `workflowNodesToReactFlow` and API handle `parentId` and `extent: 'parent'` for child nodes.
  - **Why**: Users can create frames and group nodes.
  - **Pattern**: ReactFlow Parent Nodes: child nodes have `parentId`, `extent: 'parent'`; parent has `style: { width, height }`.
  - **Integration**: Frame creation calls workflow nodes API; node assignment updates nodes with `parentId`.
  - **Verify**: Create frame; drag nodes into frame (or use "Add to frame"); nodes are visually inside frame.

- [x] 5.5 Wire frame to context menu and command palette
  - **File**: `src/components/builder/builder-canvas.tsx`, `builder-command-palette.tsx`, `builder-context-menu.tsx` (modify existing)
  - **What**: Enable "Add Frame" in pane context menu and command palette. Remove "placeholder" or "disabled" state. Call the add-frame handler from Task 5.4.
  - **Why**: Completes frame feature accessibility.
  - **Verify**: CMD+K → "Add Frame" creates frame; right-click pane → "Add Frame" creates frame.

---
