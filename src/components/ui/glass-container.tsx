import { cn } from "@/lib/utils"

interface GlassContainerProps {
  children: React.ReactNode
  className?: string
  innerClassName?: string
}

function GlassContainer({ children, className, innerClassName }: GlassContainerProps) {
  return (
    <div
      data-slot="glass-container"
      className={cn(
        "rounded-2xl bg-gradient-to-b from-black/10 to-white/10 p-px backdrop-blur-lg dark:from-white/10 dark:to-white/5",
        className,
      )}
    >
      <div
        className={cn("rounded-2xl bg-white/95 backdrop-blur-md dark:bg-black/80", innerClassName)}
      >
        {children}
      </div>
    </div>
  )
}

export { GlassContainer }
