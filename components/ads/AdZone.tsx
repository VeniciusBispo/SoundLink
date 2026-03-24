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

  useEffect(() => {
    setIsMobile(window.innerWidth < 768)
    const handleResize = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const activeKey = (isMobile && mobileZoneKey) ? mobileZoneKey : zoneKey
  const activeFormat = (isMobile && mobileZoneKey) ? '320x50' : format

  const atOptions = activeKey ? {
    key: activeKey,
    format: 'iframe',
    height: activeFormat === '728x90' ? 90 : activeFormat === '468x60' ? 60 : activeFormat === '320x50' ? 50 : activeFormat === '300x250' ? 250 : activeFormat === '160x600' ? 600 : 90,
    width: activeFormat === '728x90' ? 728 : activeFormat === '468x60' ? 468 : activeFormat === '320x50' ? 320 : activeFormat === '300x250' ? 300 : activeFormat === '160x600' ? 160 : 728,
    params: {},
  } : null;

  return (
    <div className={`flex flex-col items-center justify-center py-2 px-1 overflow-hidden min-h-[60px] w-full ${className}`}>
      <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-white/20">Publicidade</p>
      
      <div className="relative w-full flex justify-center items-center overflow-hidden">
        <div 
          ref={containerRef} 
          id={`ad-container-${activeKey}`}
          className="bg-white/5 rounded-lg border border-white/5 flex items-center justify-center transition-all duration-700 overflow-hidden"
          style={{ 
            width: typeof window !== 'undefined' && window.innerWidth < 768 && mobileZoneKey ? '320px' : atOptions?.width || '300px',
            height: typeof window !== 'undefined' && window.innerWidth < 768 && mobileZoneKey ? '50px' : atOptions?.height || '250px',
            transform: typeof window !== 'undefined' && window.innerWidth < 768 && !mobileZoneKey && activeFormat === '728x90' 
              ? `scale(${(window.innerWidth - 20) / 728})` 
              : 'none',
          }}
        >
          {!zoneKey ? (
            <span className="text-white/5 italic text-[10px]">Configurar Zone ID</span>
          ) : (
            <>
              {/* Fallback Loading Pulse - Enhanced for immediate presence */}
              <div className="absolute inset-0 flex items-center justify-center bg-white/5 animate-pulse">
                <div className="flex flex-col items-center gap-2">
                  <div className="w-8 h-8 rounded-full border-2 border-white/20 border-t-white/60 animate-spin" />
                  <span className="text-[10px] text-white/20 font-medium">Carregando...</span>
                </div>
              </div>
              
              {/* Isolated Ad Sandbox */}
              <iframe
                title={`Ad ${activeKey}`}
                srcDoc={`
                  <!DOCTYPE html>
                  <html>
                    <head>
                      <style>body { margin: 0; padding: 0; display: flex; justify-content: center; align-items: center; overflow: hidden; background: transparent; }</style>
                    </head>
                    <body>
                      <script type="text/javascript">
                        atOptions = ${JSON.stringify(atOptions)};
                        document.write('<scr' + 'ipt type="text/javascript" src="https://www.highperformanceformat.com/${activeKey}/invoke.js"></scr' + 'ipt>');
                      </script>
                    </body>
                  </html>
                `}
                className="w-full h-full border-none relative z-10"
                scrolling="no"
                frameBorder="0"
                allowTransparency={true}
              />
            </>
          )}
        </div>
      </div>
    </div>
  )
}
