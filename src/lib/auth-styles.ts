export const ghostAuthClassName = [
  "bg-transparent",
  "border-white/10",
  "text-white",
  "placeholder:text-white/40",
  "focus:border-white/30",
  "focus:ring-0",
  "transition-colors",
  "text-base",
].join(" ")

export const ghostCardClassName = "w-full max-w-md border-white/10 bg-transparent"

export const authMountTransition = {
  type: "spring" as const,
  stiffness: 150,
  damping: 25,
}
