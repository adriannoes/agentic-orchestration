"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"

interface MarketplaceErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function MarketplaceError({ error, reset }: MarketplaceErrorProps) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <h2 className="mb-2 text-xl font-bold">Something went wrong!</h2>
      <p className="text-muted-foreground mb-4">We couldn&apos;t load the agent registry.</p>
      <Button onClick={() => reset()}>Try again</Button>
    </div>
  )
}
