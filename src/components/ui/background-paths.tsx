"use client"

import { motion } from "framer-motion"
import { useMemo } from "react"
import { cn } from "@/lib/utils"

interface BackgroundPathsProps {
  className?: string
  pathCount?: number
}

function seededRandom(seed: number): (n: number) => number {
  return (n: number) => (Math.sin(seed * n) + 1) / 2
}

function createPathData(index: number): string {
  const f = seededRandom(index * 7919 + 1)
  const y0 = 5 + f(1) * 90
  const y1 = 5 + f(2) * 90
  const c1x = 20 + f(3) * 60
  const c1y = 10 + f(4) * 80
  const c2x = 40 + f(5) * 50
  const c2y = 20 + f(6) * 60
  return `M 0 ${y0} C ${c1x} ${c1y} ${c2x} ${c2y} 100 ${y1}`
}

/** Decorative animated path background. No Lucide equivalent — design system exception (S5). */
function BackgroundPaths({ className, pathCount = 6 }: BackgroundPathsProps) {
  const paths = useMemo(() => {
    return Array.from({ length: pathCount }, (_, i) => ({
      d: createPathData(i),
      opacity: 0.03 + i * 0.015,
      duration: 20 + i * 5,
    }))
  }, [pathCount])

  return (
    <div className={cn("text-foreground absolute inset-0 -z-10 overflow-hidden", className)}>
      <svg className="h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden>
        {paths.map(({ d, opacity, duration }, i) => (
          <motion.path
            key={i}
            d={d}
            fill="none"
            stroke="currentColor"
            strokeWidth={0.5}
            opacity={opacity}
            strokeDasharray="1000"
            initial={{ strokeDashoffset: 1000 }}
            animate={{ strokeDashoffset: 0 }}
            transition={{
              duration,
              repeat: Infinity,
              repeatType: "loop",
              ease: "linear",
            }}
            className={i >= 4 ? "max-md:hidden" : undefined}
          />
        ))}
      </svg>
    </div>
  )
}

export { BackgroundPaths }
