'use client'

import { useEffect, useRef, useState } from 'react'

interface AdZoneProps {
  zoneKey: string
  mobileZoneKey?: string
  format?: '728x90' | '160x600' | '300x250' | '320x50' | '468x60'
  className?: string
}

export default function AdZone({ zoneKey, mobileZoneKey, format = '728x90', className }: AdZoneProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isMobile, setIsMobile] = useState(false)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsMobile(window.innerWidth < 768)
    const handleResize = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', handleResize)

    // Senior Intersection Observer: Load ad slightly before it enters viewport
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      { rootMargin: '400px' } // Pre-load with 400px margin
    )

    if (containerRef.current) {
      observer.observe(containerRef.current)
    }

    return () => {
      window.removeEventListener('resize', handleResize)
      observer.disconnect()
    }
  }, [])

  const activeKey = (isMobile && mobileZoneKey) ? mobileZoneKey : zoneKey
  const activeFormat = (isMobile && mobileZoneKey) ? '320x50' : format

  const dimensions = {
    '728x90': { w: 728, h: 90 },
    '468x60': { w: 468, h: 60 },
    '320x50': { w: 320, h: 50 },
    '300x250': { w: 300, h: 250 },
    '160x600': { w: 160, h: 600 },
  }[activeFormat] || { w: 728, h: 90 }

  const atOptions = activeKey ? {
    key: activeKey,
    format: 'iframe',
    height: dimensions.h,
    width: dimensions.w,
    params: {},
  } : null;

  return (
    <div 
      ref={containerRef}
      className={`flex flex-col items-center justify-center py-4 px-1 w-full overflow-hidden ${className}`}
    >
      <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-white/10">Publicidade</p>
      
      <div 
        className="relative bg-white/[0.02] rounded-xl border border-white/[0.05] overflow-hidden transition-all duration-500 shadow-2xl"
        style={{ 
          width: isMobile ? 'min(100%, 320px)' : `${dimensions.w}px`,
          height: isMobile ? '50px' : `${dimensions.h}px`,
          aspectRatio: isMobile ? '320 / 50' : `${dimensions.w} / ${dimensions.h}`,
        }}
      >
        {!zoneKey ? (
          <div className="absolute inset-0 flex items-center justify-center bg-red-500/5">
            <span className="text-red-500/40 text-[10px] uppercase font-bold tracking-tighter">Missing Zone ID</span>
          </div>
        ) : (
          <>
            {/* Senior Glassmorphism Skeleton */}
            <div className={`absolute inset-0 flex flex-col items-center justify-center transition-opacity duration-1000 ${isVisible ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
              <div className="w-full h-full bg-gradient-to-r from-transparent via-white/[0.03] to-transparent animate-shimmer" style={{ backgroundSize: '200% 100%' }} />
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                <div className="w-10 h-10 rounded-full border-t-2 border-green-500/40 animate-spin" />
                <span className="text-[10px] text-white/30 font-medium tracking-widest uppercase">Otimizando anúncio...</span>
              </div>
            </div>
            
            {/* Senior Dynamic Ad Injection */}
            {isVisible && (
              <iframe
                title={`Ad ${activeKey}`}
                srcDoc={`
                  <!DOCTYPE html>
                  <html>
                    <head>
                      <style>
                        body { margin: 0; padding: 0; display: flex; justify-content: center; align-items: center; overflow: hidden; background: transparent; }
                      </style>
                    </head>
                    <body>
                      <script type="text/javascript">
                        atOptions = ${JSON.stringify(atOptions)};
                        const script = document.createElement('script');
                        script.type = 'text/javascript';
                        script.src = 'https://www.highperformanceformat.com/${activeKey}/invoke.js';
                        document.body.appendChild(script);
                      </script>
                    </body>
                  </html>
                `}
                className="w-full h-full border-none relative z-10 opacity-0 transition-opacity duration-700"
                onLoad={(e) => (e.currentTarget.style.opacity = '1')}
                scrolling="no"
                frameBorder="0"
                allowTransparency={true}
              />
            )}
          </>
        )}
      </div>
    </div>
  )
}
