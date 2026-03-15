'use client'

import { useState } from 'react'
import { HiSearch } from 'react-icons/hi'
import { useRouter } from 'next/navigation'
import { useUIStore } from '@/store/uiStore'

export default function SearchBar() {
  const router = useRouter()
  const searchQuery = useUIStore((s) => s.searchQuery)
  const setSearchQuery = useUIStore((s) => s.setSearchQuery)
  const [localQuery, setLocalQuery] = useState(searchQuery)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!localQuery.trim()) return
    setSearchQuery(localQuery.trim())
    router.push(`/explore?q=${encodeURIComponent(localQuery.trim())}`)
  }

  return (
    <form onSubmit={handleSubmit} className="relative">
      <HiSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-spotify-text" />
      <input
        type="search"
        value={localQuery}
        onChange={(e) => setLocalQuery(e.target.value)}
        placeholder="O que você quer ouvir?"
        className="w-full rounded-full bg-white py-2 pl-9 pr-4 text-sm text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-spotify-green"
      />
    </form>
  )
}
