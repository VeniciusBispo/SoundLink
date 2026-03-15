'use client'

import { useEffect, useRef } from 'react'

interface AdBannerProps {
  /** AdSense data-ad-slot value — get from your AdSense account */
  slot: string
  /** horizontal (leaderboard) | vertical (skyscraper) | rectangle (medium rectangle) */
  format?: 'horizontal' | 'vertical' | 'rectangle' | 'auto'
  className?: string
}

declare global {
  interface Window {
    adsbygoogle: unknown[]
  }
}

export default function AdBanner({ slot, format = 'auto', className = '' }: AdBannerProps) {
  const pushed = useRef(false)

  useEffect(() => {
    if (pushed.current) return
    try {
      ;(window.adsbygoogle = window.adsbygoogle || []).push({})
      pushed.current = true
    } catch {
      // adsbygoogle not loaded yet (dev mode or ad blocker)
    }
  }, [])

  const formatMap = {
    horizontal: 'auto',
    vertical: 'auto',
    rectangle: 'rectangle',
    auto: 'auto',
  }

  const styleMap: Record<string, React.CSSProperties> = {
    horizontal: { display: 'block', width: '100%', height: '90px' },
    vertical: { display: 'block', width: '160px', height: '600px' },
    rectangle: { display: 'block', width: '300px', height: '250px' },
    auto: { display: 'block' },
  }

  return (
    <div className={`overflow-hidden ${className}`}>
      <ins
        className="adsbygoogle"
        style={styleMap[format]}
        data-ad-client={process.env.NEXT_PUBLIC_ADSENSE_ID}
        data-ad-slot={slot}
        data-ad-format={formatMap[format]}
        data-full-width-responsive="true"
      />
    </div>
  )
}
