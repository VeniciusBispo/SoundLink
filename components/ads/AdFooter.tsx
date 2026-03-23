'use client'

import AdZone from './AdZone'

export default function AdFooter() {
  // ATENÇÃO: Substitua pelo seu Zone ID do Adsterra ou PropellerAds
  const ADSTERRA_ZONE_KEY = '861d749601dfaf98fb0e62a9bee365bc' 

  if (!ADSTERRA_ZONE_KEY) return null

  return (
    <div className="flex flex-shrink-0 items-center justify-center w-full bg-black border-t border-white/5 z-30">
      <AdZone 
        zoneKey={ADSTERRA_ZONE_KEY} 
        mobileZoneKey="5acb4ba8ffe25a92c59c05d76b637e2f"
        format="728x90" 
        className="py-1" 
      />
    </div>
  )
}
