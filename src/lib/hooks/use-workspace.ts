"use client"

import useSWR from "swr"
import type { Workspace } from "@/lib/db/workspaces"

const fetcher = async (url: string) => {
  const res = await fetch(url)
  if (res.status === 401) return null
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

export function useWorkspace() {
  const {
    data: workspace,
    isLoading: loading,
    error,
  } = useSWR<Workspace | null>("/api/workspaces", fetcher, { revalidateOnFocus: false })

  return { workspace: workspace ?? null, loading, error }
}
