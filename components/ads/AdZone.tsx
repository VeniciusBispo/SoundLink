'use client'

import { useEffect, useRef } from 'react'

interface AdZoneProps {
  zoneKey: string
  format?: '728x90' | '160x600' | '300x250'
  className?: string
}

/**
 * AdZone Component
 * Handles the safe injection of Adsterra/PropellerAds scripts in a Next.js environment.
 * IMPORTANT: Replace placeholder zoneKey with your real ID from the dashboard.
 */
export default function AdZone({ zoneKey, format = '728x90', className }: AdZoneProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Prevent execution if no key is provided or if already loaded
    if (!zoneKey || !containerRef.current || containerRef.current.innerHTML !== '') return

    const container = containerRef.current
    
    // Config for Adsterra (standard iframe banner)
    const atOptions = {
      key: zoneKey,
      format: 'iframe',
      height: format === '728x90' ? 90 : format === '300x250' ? 250 : 600,
      width: format === '728x90' ? 728 : format === '300x250' ? 300 : 160,
      params: {},
    }

    // script 1: options
    const scriptOptions = document.createElement('script')
    scriptOptions.type = 'text/javascript'
    scriptOptions.innerHTML = `atOptions = ${JSON.stringify(atOptions)};`
    
    // script 2: invoker
    const scriptInvoke = document.createElement('script')
    scriptInvoke.type = 'text/javascript'
    scriptInvoke.src = `https://www.highperformanceformat.com/${zoneKey}/invoke.js`
    scriptInvoke.async = true

    container.appendChild(scriptOptions)
    container.appendChild(scriptInvoke)

    return () => {
      if (container) container.innerHTML = ''
    }
  }, [zoneKey, format])

  return (
    <div className={`flex flex-col items-center justify-center py-4 px-2 overflow-hidden min-h-[100px] ${className}`}>
      <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-white/20">Publicidade</p>
      <div 
        ref={containerRef} 
        id={`ad-container-${zoneKey}`}
        className="mx-auto bg-white/5 rounded-lg border border-white/5 flex items-center justify-center text-white/10 italic text-xs"
        style={{ 
          width: format === '728x90' ? '728px' : format === '300x250' ? '300px' : '160px',
          height: format === '728x90' ? '90px' : format === '300x250' ? '250px' : '600px',
          maxWidth: '100%'
        }}
      >
        {/* Ad will be injected here */}
        {!zoneKey && <span>Configurar Zone ID</span>}
      </div>
    </div>
  )
}
