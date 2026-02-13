import type { Workflow, WorkflowVersion, VersionComparison } from "./workflow-types"

class VersionStore {
  private versions: Map<string, WorkflowVersion[]> = new Map()

  createVersion(workflow: Workflow, description?: string): WorkflowVersion {
    const version: WorkflowVersion = {
      id: crypto.randomUUID(),
      workflowId: workflow.id,
      version: workflow.version,
      name: `v${workflow.version}`,
      description,
      nodes: JSON.parse(JSON.stringify(workflow.nodes)),
      connections: JSON.parse(JSON.stringify(workflow.connections)),
      createdAt: new Date(),
      tags: [],
    }

    const existingVersions = this.versions.get(workflow.id) || []
    existingVersions.push(version)
    this.versions.set(workflow.id, existingVersions)

    return version
  }

  getVersions(workflowId: string): WorkflowVersion[] {
    return (this.versions.get(workflowId) || []).sort((a, b) => b.version - a.version)
  }

  getVersion(workflowId: string, versionNumber: number): WorkflowVersion | undefined {
    const versions = this.versions.get(workflowId) || []
    return versions.find((v) => v.version === versionNumber)
  }

  compareVersions(workflowId: string, version1: number, version2: number): VersionComparison | null {
    const v1 = this.getVersion(workflowId, version1)
    const v2 = this.getVersion(workflowId, version2)

    if (!v1 || !v2) return null

    const added = {
      nodes: v2.nodes.filter((n2) => !v1.nodes.find((n1) => n1.id === n2.id)),
      connections: v2.connections.filter((c2) => !v1.connections.find((c1) => c1.id === c2.id)),
    }

    const removed = {
      nodes: v1.nodes.filter((n1) => !v2.nodes.find((n2) => n2.id === n1.id)),
      connections: v1.connections.filter((c1) => !v2.connections.find((c2) => c2.id === c1.id)),
    }

    const modified = v2.nodes
      .map((n2) => {
        const n1 = v1.nodes.find((n) => n.id === n2.id)
        if (n1 && JSON.stringify(n1) !== JSON.stringify(n2)) {
          return { old: n1, new: n2 }
        }
        return null
      })
      .filter((m) => m !== null) as Array<{ old: (typeof v1.nodes)[0]; new: (typeof v2.nodes)[0] }>

    return { added, removed, modified }
  }

  tagVersion(workflowId: string, versionNumber: number, tag: string): boolean {
    const versions = this.versions.get(workflowId) || []
    const version = versions.find((v) => v.version === versionNumber)

    if (!version) return false

    if (!version.tags) version.tags = []
    if (!version.tags.includes(tag)) {
      version.tags.push(tag)
    }

    return true
  }

  deleteVersion(workflowId: string, versionNumber: number): boolean {
    const versions = this.versions.get(workflowId) || []
    const filtered = versions.filter((v) => v.version !== versionNumber)

    if (filtered.length === versions.length) return false

    this.versions.set(workflowId, filtered)
    return true
  }
}

export const versionStore = new VersionStore()
