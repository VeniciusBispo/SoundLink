'use client'

import { useMemo } from 'react'

interface WaveformProgressProps {
  progress: number
  isHovering: boolean
}

export default function WaveformProgress({ progress, isHovering }: WaveformProgressProps) {
  // Deterministic "random" heights for the bars
  const bars = useMemo(() => {
    const count = 100
    return Array.from({ length: count }, (_, i) => {
      // Improved waveform-like height function
      const h1 = Math.sin(i * 0.15) * 20
      const h2 = Math.sin(i * 0.35) * 15
      const h3 = Math.sin(i * 0.05) * 25
      const base = 40
      return Math.abs(base + h1 + h2 + h3)
    })
  }, [])

  return (
    <div className="flex items-center gap-[1px] h-8 w-full px-0.5">
      {bars.map((height, i) => {
        const barProgress = (i / bars.length) * 100
        const isActive = barProgress < progress

        return (
          <div
            key={i}
            className="flex-1 rounded-sm transition-all duration-300"
            style={{
              height: `${isHovering ? (height * 1.1) : height}%`,
              backgroundColor: isActive
                ? (isHovering ? '#b3b3f1' : '#9a9ae6')
                : '#262626',
              boxShadow: isActive && isHovering ? '0 0 10px rgba(154, 154, 230, 0.5)' : 'none'
            }}
          />
        )
      })}
    </div>
  )
}
