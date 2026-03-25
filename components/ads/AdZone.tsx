'use client'

import { useEffect, useRef, useState } from 'react'

interface AdZoneProps {
  slotId?: string
  format?: '728x90' | '160x600' | '300x250' | '320x50' | '468x60' | 'auto'
  className?: string
  style?: React.CSSProperties
}

export default function AdZone({ slotId, format = '728x90', className, style }: AdZoneProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isMobile, setIsMobile] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)

  const AD_CLIENT = "ca-pub-9556522152269793"

  useEffect(() => {
    setIsMobile(window.innerWidth < 768)
    const handleResize = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', handleResize)

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      { rootMargin: '400px' }
    )

    if (containerRef.current) {
      observer.observe(containerRef.current)
    }

    return () => {
      window.removeEventListener('resize', handleResize)
      observer.disconnect()
    }
  }, [])

  useEffect(() => {
    if (isVisible && !isLoaded) {
      try {
        // @ts-ignore
        (window.adsbygoogle = window.adsbygoogle || []).push({})
        setIsLoaded(true)
      } catch (err) {
        console.error('AdSense error:', err)
      }
    }
  }, [isVisible, isLoaded])

  const dimensions = {
    '728x90': { w: 728, h: 90 },
    '468x60': { w: 468, h: 60 },
    '320x50': { w: 320, h: 50 },
    '300x250': { w: 300, h: 250 },
    '160x600': { w: 160, h: 600 },
    'auto': { w: '100%', h: 'auto' }
  }[format] || { w: 728, h: 90 }

  return (
    <div 
      ref={containerRef}
      className={`flex flex-col items-center justify-center py-4 px-1 w-full overflow-hidden ${className}`}
      style={style}
    >
      <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-white/5">Publicidade</p>
      
      <div 
        className="relative bg-white/[0.01] rounded-xl border border-white/[0.03] overflow-hidden transition-all duration-500"
        style={{ 
          width: format === 'auto' ? '100%' : (isMobile ? 'min(100%, 320px)' : `${dimensions.w}px`),
          minHeight: format === 'auto' ? '100px' : (isMobile ? '50px' : `${dimensions.h}px`),
        }}
      >
        {!slotId ? (
          <div className="absolute inset-0 flex items-center justify-center bg-white/[0.02]">
            <span className="text-white/20 text-[10px] uppercase font-bold tracking-widest">Espaço Publicitário</span>
          </div>
        ) : (
          <>
            {/* Skeleton / Placeholder while loading */}
            {!isLoaded && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/[0.02] animate-pulse">
                <div className="w-8 h-8 rounded-full border-t-2 border-white/10 animate-spin" />
              </div>
            )}
            
            {isVisible && (
              <ins
                className="adsbygoogle"
                style={{
                  display: 'block',
                  textAlign: 'center',
                  width: '100%',
                  height: '100%',
                  ...(format === 'auto' ? {} : { width: `${dimensions.w}px`, height: `${dimensions.h}px` })
                }}
                data-ad-client={AD_CLIENT}
                data-ad-slot={slotId}
                data-ad-format={format === 'auto' ? 'auto' : undefined}
                data-full-width-responsive={format === 'auto' ? 'true' : undefined}
              />
            )}
          </>
        )}
      </div>
    </div>
  )
}
