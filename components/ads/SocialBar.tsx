'use client'

import Script from 'next/script'

/**
 * SocialBar Component
 * Injects the Adsterra Social Bar script.
 * This is a floating ad that doesn't occupy fixed layout space.
 */
export default function SocialBar() {
  return (
    <Script
      src="https://pl28965926.profitablecpmratenetwork.com/8f/61/21/8f61213b8b1e7f3ba0593ac36c073d22.js"
      strategy="afterInteractive"
    />
  )
}
