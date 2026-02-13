"use client"

import { useEffect, useState } from "react"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import type { Agent } from "@/lib/types"
import type { RealtimePostgresChangesPayload } from "@supabase/supabase-js"

export function useRealtimeAgents(workspaceId: string, initialAgents: Agent[] = []) {
  const [agents, setAgents] = useState<Agent[]>(initialAgents)

  useEffect(() => {
    const supabase = getSupabaseBrowserClient()

    const channel = supabase
      .channel(`agents:${workspaceId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "agents",
          filter: `workspace_id=eq.${workspaceId}`,
        },
        (payload: RealtimePostgresChangesPayload<Agent>) => {
          setAgents((current) => [payload.new as Agent, ...current])
        },
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "agents",
          filter: `workspace_id=eq.${workspaceId}`,
        },
        (payload: RealtimePostgresChangesPayload<Agent>) => {
          setAgents((current) => current.map((agent) => (agent.id === payload.new.id ? (payload.new as Agent) : agent)))
        },
      )
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "agents",
          filter: `workspace_id=eq.${workspaceId}`,
        },
        (payload: RealtimePostgresChangesPayload<Agent>) => {
          setAgents((current) => current.filter((agent) => agent.id !== payload.old.id))
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [workspaceId])

  return agents
}
