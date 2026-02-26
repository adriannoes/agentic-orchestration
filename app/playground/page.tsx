import { Suspense } from "react"
import { PlaygroundInterface } from "@/components/playground-interface"

export default function PlaygroundPage() {
  return (
    <Suspense fallback={<div className="flex min-h-[200px] items-center justify-center text-muted-foreground">Loading…</div>}>
      <PlaygroundInterface />
    </Suspense>
  )
}
