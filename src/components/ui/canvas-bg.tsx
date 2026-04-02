"use client"

import React, { useRef, useMemo, useEffect } from "react"
import { Canvas, useThree, useFrame } from "@react-three/fiber"
import * as THREE from "three"
import { cn } from "@/lib/utils"
import { useCanvasVisibility } from "@/hooks/use-canvas-visibility"
import { useIsMobile } from "@/hooks/use-mobile"

// Suppress upstream THREE.Clock deprecation from @react-three/fiber internals (v9.5.0)
if (typeof window !== "undefined") {
  const origWarn = console.warn
  console.warn = (...args: unknown[]) => {
    if (
      typeof args[0] === "string" &&
      (args[0].includes("THREE.Clock") || args[0].includes("three.module.js"))
    )
      return
    origWarn.apply(console, args)
  }
}

const DOT_MATRIX_VERTEX = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const DOT_MATRIX_FRAGMENT = /* glsl */ `
  uniform float uTime;
  uniform vec3 uColor;
  varying vec2 vUv;

  void main() {
    float scale = 24.0;
    vec2 uv = vUv * scale;
    vec2 grid = floor(uv);
    vec2 f = fract(uv);
    float r = 0.18;
    float d = length(f - 0.5);
    float dotVal = 1.0 - smoothstep(r - 0.02, r, d);
    float pulse = 0.6 + 0.4 * sin(uTime * 0.4);
    float alpha = dotVal * pulse * 0.12;
    gl_FragColor = vec4(uColor, alpha);
  }
`

const COLOR_SCHEMES = {
  indigo: new THREE.Color(0x6366f1),
  zinc: new THREE.Color(0x71717a),
} as const

interface DotMatrixSceneProps {
  colorScheme?: "indigo" | "zinc"
}

function DotMatrixScene({ colorScheme = "zinc" }: DotMatrixSceneProps) {
  const materialRef = useRef<THREE.ShaderMaterial>(null)
  const color = useMemo(() => COLOR_SCHEMES[colorScheme].clone(), [colorScheme])

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uColor: { value: color },
    }),
    [color],
  )

  useFrame((_, delta) => {
    if (materialRef.current?.uniforms?.uTime) {
      materialRef.current.uniforms.uTime.value += delta * 0.3
    }
  })

  return (
    <mesh>
      <planeGeometry args={[4, 4]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={DOT_MATRIX_VERTEX}
        fragmentShader={DOT_MATRIX_FRAGMENT}
        uniforms={uniforms}
        transparent
        depthWrite={false}
      />
    </mesh>
  )
}

interface RenderTriggerProps {
  isVisible: boolean
}

function RenderTrigger({ isVisible }: RenderTriggerProps) {
  const invalidate = useThree((s) => s.invalidate)
  const isActiveRef = useRef(isVisible)

  useEffect(() => {
    isActiveRef.current = isVisible
  }, [isVisible])

  useEffect(() => {
    if (!isVisible) return
    let frameId: ReturnType<typeof setTimeout>
    const TARGET_FPS = 20
    const INTERVAL = 1000 / TARGET_FPS

    const loop = () => {
      if (isActiveRef.current) {
        invalidate()
      }
      frameId = setTimeout(loop, INTERVAL)
    }
    frameId = setTimeout(loop, INTERVAL)
    return () => clearTimeout(frameId)
  }, [isVisible, invalidate])

  return null
}

const WEBGL_FALLBACK_CLASS =
  "absolute inset-0 bg-gradient-to-br from-background via-primary/10 to-background"

interface WebGLErrorBoundaryState {
  hasError: boolean
}

class WebGLErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback: React.ReactNode },
  WebGLErrorBoundaryState
> {
  state = { hasError: false }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  render() {
    if (this.state.hasError) return this.props.fallback
    return this.props.children
  }
}

interface CanvasBgProps {
  className?: string
  colorScheme?: "indigo" | "zinc"
}

function CanvasBgInner({ className, colorScheme }: CanvasBgProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const isVisible = useCanvasVisibility(containerRef)
  const isMobile = useIsMobile()

  const dpr: [number, number] = isMobile ? [1, 1] : [1, 1.5]

  return (
    <div
      ref={containerRef}
      className={cn("absolute inset-0 -z-10", className)}
      data-testid="canvas-bg"
    >
      <Canvas
        frameloop="demand"
        dpr={dpr}
        gl={{ antialias: false, alpha: true }}
        camera={{ position: [0, 0, 1], fov: 75 }}
      >
        <RenderTrigger isVisible={isVisible} />
        <DotMatrixScene colorScheme={colorScheme} />
      </Canvas>
    </div>
  )
}

export function CanvasBg({ className, colorScheme = "zinc" }: CanvasBgProps) {
  return (
    <WebGLErrorBoundary
      fallback={
        <div
          className={cn("absolute inset-0 -z-10", WEBGL_FALLBACK_CLASS, className)}
          data-testid="canvas-bg-fallback"
        />
      }
    >
      <CanvasBgInner className={className} colorScheme={colorScheme} />
    </WebGLErrorBoundary>
  )
}
