"use client"

import { useEffect, useState } from "react"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"

export function useWorkspace() {
  const [workspace, setWorkspace] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = getSupabaseBrowserClient()

    async function loadWorkspace() {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        setLoading(false)
        return
      }

      const { data } = await supabase
        .from("workspace_members")
        .select("workspace_id, workspaces(*)")
        .eq("user_id", user.id)
        .limit(1)
        .single()

      if (data) {
        setWorkspace(data.workspaces)
      }
      setLoading(false)
    }

    loadWorkspace()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN") {
        loadWorkspace()
      } else if (event === "SIGNED_OUT") {
        setWorkspace(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  return { workspace, loading }
}
