'use client'

import { useEffect, useRef, useState } from 'react'
import { HiX } from 'react-icons/hi'

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

  useEffect(() => {
    // Se não tiver chave ou se já houver conteúdo injetado, não faz nada
    if (!activeKey || !containerRef.current || containerRef.current.innerHTML.includes('iframe') || containerRef.current.innerHTML.includes('script')) return

    const container = containerRef.current
    
    // Injeção direta sem atrasos artificiais
    const atOptions = {
        key: activeKey,
        format: 'iframe',
        height: activeFormat === '728x90' ? 90 : activeFormat === '468x60' ? 60 : activeFormat === '320x50' ? 50 : activeFormat === '300x250' ? 250 : 600,
        width: activeFormat === '728x90' ? 728 : activeFormat === '468x60' ? 468 : activeFormat === '320x50' ? 320 : activeFormat === '300x250' ? 300 : 160,
        params: {},
    }

    const scriptOptions = document.createElement('script')
    scriptOptions.type = 'text/javascript'
    scriptOptions.innerHTML = `atOptions = ${JSON.stringify(atOptions)};`
    
    const scriptInvoke = document.createElement('script')
    scriptInvoke.type = 'text/javascript'
    scriptInvoke.src = `https://www.highperformanceformat.com/${activeKey}/invoke.js`
    
    // Anexar scripts diretamente
    container.appendChild(scriptOptions)
    container.appendChild(scriptInvoke)

    // NOTA: Removido o cleanup agressivo que limpava o InnerHTML, pois isso pode deletar o anúncio
    // se o React fizer uma re-renderização rápida de reconciliação.
  }, [zoneKey, mobileZoneKey, format, activeKey, activeFormat])

  return (
    <div className={`flex flex-col items-center justify-center py-2 px-1 overflow-hidden min-h-[60px] w-full ${className}`}>
      <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-white/20">Publicidade</p>
      
      <div className="relative w-full flex justify-center items-center overflow-hidden">
        <div 
          ref={containerRef} 
          id={`ad-container-${zoneKey}`}
          className="bg-white/5 rounded-lg border border-white/5 flex items-center justify-center text-white/5 italic text-[10px] transition-all duration-700"
          style={{ 
            width: typeof window !== 'undefined' && window.innerWidth < 768 && mobileZoneKey ? '320px' : activeFormat === '728x90' ? '728px' : activeFormat === '468x60' ? '468px' : activeFormat === '160x600' ? '160px' : '300px',
            height: typeof window !== 'undefined' && window.innerWidth < 768 && mobileZoneKey ? '50px' : activeFormat === '728x90' ? '90px' : activeFormat === '468x60' ? '60px' : activeFormat === '160x600' ? '600px' : '250px',
            transform: typeof window !== 'undefined' && window.innerWidth < 768 && !mobileZoneKey && activeFormat === '728x90' 
              ? `scale(${(window.innerWidth - 20) / 728})` 
              : 'none',
          }}
        >
          {!zoneKey ? <span>Configurar Zone ID</span> : (
            <div className="flex flex-col items-center gap-2 opacity-30 text-center p-2">
                <div className="w-4 h-4 rounded-full border border-white/10 border-t-white/40 animate-spin" />
                {typeof window !== 'undefined' && window.location.hostname === 'localhost' && (
                    <span className="text-[8px] uppercase tracking-tighter">Ads bloqueados em Localhost</span>
                )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
