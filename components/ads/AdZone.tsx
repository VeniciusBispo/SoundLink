'use client'

import { useEffect, useRef } from 'react'

interface AdZoneProps {
  zoneKey: string
  mobileZoneKey?: string
  format?: '728x90' | '160x600' | '300x250' | '320x50'
  className?: string
}

export default function AdZone({ zoneKey, mobileZoneKey, format = '728x90', className }: AdZoneProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768
    const activeKey = (isMobile && mobileZoneKey) ? mobileZoneKey : zoneKey
    const activeFormat = (isMobile && mobileZoneKey) ? '320x50' : format

    if (!activeKey || !containerRef.current || containerRef.current.innerHTML !== '') return

    const container = containerRef.current
    
    const atOptions = {
      key: activeKey,
      format: 'iframe',
      height: activeFormat === '728x90' ? 90 : activeFormat === '320x50' ? 50 : activeFormat === '300x250' ? 250 : 600,
      width: activeFormat === '728x90' ? 728 : activeFormat === '320x50' ? 320 : activeFormat === '300x250' ? 300 : 160,
      params: {},
    }

    const scriptOptions = document.createElement('script')
    scriptOptions.type = 'text/javascript'
    scriptOptions.innerHTML = `atOptions = ${JSON.stringify(atOptions)};`
    
    const scriptInvoke = document.createElement('script')
    scriptInvoke.type = 'text/javascript'
    scriptInvoke.src = `https://www.highperformanceformat.com/${activeKey}/invoke.js`
    scriptInvoke.async = true

    container.appendChild(scriptOptions)
    container.appendChild(scriptInvoke)

    return () => {
      if (container) container.innerHTML = ''
    }
  }, [zoneKey, mobileZoneKey, format])

  return (
    <div className={`flex flex-col items-center justify-center py-2 px-1 overflow-hidden min-h-[60px] w-full ${className}`}>
      <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-white/20">Publicidade</p>
      
      <div className="relative w-full flex justify-center items-center overflow-hidden">
        <div 
          ref={containerRef} 
          id={`ad-container-${zoneKey}`}
          className="bg-white/5 rounded-lg border border-white/5 flex items-center justify-center text-white/10 italic text-xs transition-transform origin-center"
          style={{ 
            width: typeof window !== 'undefined' && window.innerWidth < 768 && mobileZoneKey ? '320px' : format === '728x90' ? '728px' : '300px',
            height: typeof window !== 'undefined' && window.innerWidth < 768 && mobileZoneKey ? '50px' : format === '728x90' ? '90px' : '250px',
            transform: typeof window !== 'undefined' && window.innerWidth < 768 && !mobileZoneKey && format === '728x90' 
              ? `scale(${(window.innerWidth - 20) / 728})` 
              : 'none',
          }}
        >
          {!zoneKey && <span>Configurar Zone ID</span>}
        </div>
      </div>
    </div>
  )
}
