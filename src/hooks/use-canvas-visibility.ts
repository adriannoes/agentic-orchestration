import { useState, useEffect, type RefObject } from "react"

export function useCanvasVisibility(ref: RefObject<HTMLElement | null>) {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(([entry]) => setIsVisible(entry.isIntersecting), {
      threshold: 0.1,
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [ref])

  return isVisible
}
