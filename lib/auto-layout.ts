import type { WorkflowNode, Connection, Position } from "./workflow-types"

interface LayoutNode {
  id: string
  node: WorkflowNode
  level: number
  position: Position
  children: string[]
}

export class AutoLayout {
  private readonly NODE_WIDTH = 280
  private readonly NODE_HEIGHT = 80
  private readonly HORIZONTAL_SPACING = 200
  private readonly VERTICAL_SPACING = 120
  private readonly START_X = 100
  private readonly START_Y = 100

  /**
   * Applies hierarchical auto-layout to workflow nodes
   * Uses a top-down layered approach
   */
  applyLayout(nodes: WorkflowNode[], connections: Connection[]): WorkflowNode[] {
    if (nodes.length === 0) return nodes

    const layoutNodes = this.buildGraph(nodes, connections)
    const levels = this.assignLevels(layoutNodes, connections)
    const positioned = this.calculatePositions(levels)

    return nodes.map((node) => {
      const layoutNode = positioned.find((ln) => ln.id === node.id)
      return layoutNode ? { ...node, position: layoutNode.position } : node
    })
  }

  private buildGraph(nodes: WorkflowNode[], connections: Connection[]): Map<string, LayoutNode> {
    const graph = new Map<string, LayoutNode>()

    nodes.forEach((node) => {
      graph.set(node.id, {
        id: node.id,
        node,
        level: 0,
        position: node.position,
        children: [],
      })
    })

    connections.forEach((conn) => {
      const sourceNode = graph.get(conn.sourceId)
      if (sourceNode && !sourceNode.children.includes(conn.targetId)) {
        sourceNode.children.push(conn.targetId)
      }
    })

    return graph
  }

  private assignLevels(graph: Map<string, LayoutNode>, connections: Connection[]): LayoutNode[][] {
    const visited = new Set<string>()
    const levels: LayoutNode[][] = []

    const startNodes = Array.from(graph.values()).filter(
      (node) => node.node.type === "start" || !connections.some((c) => c.targetId === node.id),
    )

    const queue: Array<{ node: LayoutNode; level: number }> = startNodes.map((node) => ({ node, level: 0 }))

    while (queue.length > 0) {
      const { node, level } = queue.shift()!

      if (visited.has(node.id)) continue
      visited.add(node.id)

      node.level = level

      if (!levels[level]) {
        levels[level] = []
      }
      levels[level].push(node)

      node.children.forEach((childId) => {
        const childNode = graph.get(childId)
        if (childNode && !visited.has(childId)) {
          queue.push({ node: childNode, level: level + 1 })
        }
      })
    }

    Array.from(graph.values()).forEach((node) => {
      if (!visited.has(node.id)) {
        const lastLevel = levels.length
        if (!levels[lastLevel]) {
          levels[lastLevel] = []
        }
        levels[lastLevel].push(node)
      }
    })

    return levels
  }

  private calculatePositions(levels: LayoutNode[][]): LayoutNode[] {
    const positioned: LayoutNode[] = []

    levels.forEach((level, levelIndex) => {
      const levelWidth = level.length * this.NODE_WIDTH + (level.length - 1) * this.HORIZONTAL_SPACING
      const startX = this.START_X

      level.forEach((node, nodeIndex) => {
        const x = startX + nodeIndex * (this.NODE_WIDTH + this.HORIZONTAL_SPACING)
        const y = this.START_Y + levelIndex * (this.NODE_HEIGHT + this.VERTICAL_SPACING)

        node.position = { x, y }
        positioned.push(node)
      })
    })

    return positioned
  }

  /**
   * Centers the layout around the viewport
   */
  centerLayout(nodes: WorkflowNode[], viewportWidth: number, viewportHeight: number): Position {
    if (nodes.length === 0) return { x: 0, y: 0 }

    const minX = Math.min(...nodes.map((n) => n.position.x))
    const maxX = Math.max(...nodes.map((n) => n.position.x + this.NODE_WIDTH))
    const minY = Math.min(...nodes.map((n) => n.position.y))
    const maxY = Math.max(...nodes.map((n) => n.position.y + this.NODE_HEIGHT))

    const contentWidth = maxX - minX
    const contentHeight = maxY - minY

    return {
      x: (viewportWidth - contentWidth) / 2 - minX,
      y: (viewportHeight - contentHeight) / 2 - minY,
    }
  }
}

export const autoLayout = new AutoLayout()
