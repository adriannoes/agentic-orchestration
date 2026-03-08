"use client"

import dynamic from "next/dynamic"

const BuilderCanvas = dynamic(
  () => import("@/components/builder/builder-canvas").then((m) => ({ default: m.BuilderCanvas })),
  {
    ssr: false,
    loading: () => (
      <div className="bg-background flex h-screen items-center justify-center">
        <div className="text-muted-foreground">Loading workflow builder...</div>
      </div>
    ),
  },
)

export default function BuilderPage() {
  return (
    <div className="h-screen w-full overflow-hidden">
      <BuilderCanvas />
    </div>
  )
}
