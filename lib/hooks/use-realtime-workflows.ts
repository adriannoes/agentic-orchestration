"use client"

import { useEffect, useState } from "react"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import type { Workflow } from "@/lib/workflow-types"
import type { RealtimePostgresChangesPayload } from "@supabase/supabase-js"

export function useRealtimeWorkflows(workspaceId: string, initialWorkflows: Workflow[] = []) {
  const [workflows, setWorkflows] = useState<Workflow[]>(initialWorkflows)

  useEffect(() => {
    const supabase = getSupabaseBrowserClient()

    const channel = supabase
      .channel(`workflows:${workspaceId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "workflows",
          filter: `workspace_id=eq.${workspaceId}`,
        },
        (payload: RealtimePostgresChangesPayload<Workflow>) => {
          setWorkflows((current) => [payload.new as Workflow, ...current])
        },
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "workflows",
          filter: `workspace_id=eq.${workspaceId}`,
        },
        (payload: RealtimePostgresChangesPayload<Workflow>) => {
          setWorkflows((current) =>
            current.map((workflow) => (workflow.id === payload.new.id ? (payload.new as Workflow) : workflow)),
          )
        },
      )
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "workflows",
          filter: `workspace_id=eq.${workspaceId}`,
        },
        (payload: RealtimePostgresChangesPayload<Workflow>) => {
          setWorkflows((current) => current.filter((workflow) => workflow.id !== payload.old.id))
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [workspaceId])

  return workflows
}
