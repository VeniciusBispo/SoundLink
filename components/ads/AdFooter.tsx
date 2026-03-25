'use client'

import AdZone from './AdZone'

export default function AdFooter() {
  return (
    <div className="flex flex-shrink-0 items-center justify-center w-full bg-black border-t border-white/5 z-30">
      <AdZone 
        slotId="" // Adicione seu ID de bloco do AdSense aqui
        format="728x90" 
        className="py-1" 
      />
    </div>
  )
}
