"use client"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface AnimatedTextProps {
  text: string
  className?: string
  as?: "h1" | "h2" | "h3" | "p" | "span"
  delay?: number
  /** When true, animation triggers when in viewport */
  triggerOnView?: boolean
}

function AnimatedText({
  text,
  className,
  as: Tag = "h1",
  delay = 0,
  triggerOnView = false,
}: AnimatedTextProps) {
  const words = text.split(/\s+/).filter(Boolean)

  const animationProps = triggerOnView
    ? {
        initial: { y: 20, opacity: 0 },
        whileInView: { y: 0, opacity: 1 },
        viewport: { once: true, margin: "-50px" } as const,
      }
    : {
        initial: { y: 20, opacity: 0 },
        animate: { y: 0, opacity: 1 },
      }

  return (
    <Tag className={cn(className)}>
      {words.map((word, i) => (
        <motion.span
          key={`${word}-${i}`}
          className="mr-[0.25em] inline-block"
          {...animationProps}
          transition={{
            type: "spring",
            stiffness: 150,
            damping: 25,
            delay: delay + i * 0.05,
          }}
        >
          {word}
        </motion.span>
      ))}
    </Tag>
  )
}

export { AnimatedText }
