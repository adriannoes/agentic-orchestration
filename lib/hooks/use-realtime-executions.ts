"use client"

import { useEffect, useState } from "react"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import type { WorkflowExecution } from "@/lib/workflow-types"
import type { RealtimePostgresChangesPayload } from "@supabase/supabase-js"

export function useRealtimeExecutions(workspaceId: string, initialExecutions: WorkflowExecution[] = []) {
  const [executions, setExecutions] = useState<WorkflowExecution[]>(initialExecutions)

  useEffect(() => {
    const supabase = getSupabaseBrowserClient()

    const channel = supabase
      .channel(`executions:${workspaceId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "workflow_executions",
          filter: `workspace_id=eq.${workspaceId}`,
        },
        (payload: RealtimePostgresChangesPayload<WorkflowExecution>) => {
          setExecutions((current) => [payload.new as WorkflowExecution, ...current])
        },
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "workflow_executions",
          filter: `workspace_id=eq.${workspaceId}`,
        },
        (payload: RealtimePostgresChangesPayload<WorkflowExecution>) => {
          setExecutions((current) =>
            current.map((execution) =>
              execution.id === payload.new.id ? (payload.new as WorkflowExecution) : execution,
            ),
          )
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [workspaceId])

  return executions
}
