'use client'

import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { HiAdjustments, HiCheck } from 'react-icons/hi'

const THEMES = [
  { id: 'red', name: 'Vermelho', color: '#EF4444', secondary: '#F97316' },
  { id: 'purple', name: 'Roxo e Azul', color: '#8B5CF6', secondary: '#3B82F6' },
  { id: 'indigo', name: 'Indigo Clássico', color: '#6366F1', secondary: '#A855F7' },
  { id: 'sunset', name: 'Pôr do Sol', color: '#F43F5E', secondary: '#F59E0B' },
  { id: 'emerald', name: 'Esmeralda', color: '#10B981', secondary: '#0EA5E9' },
]

export default function ThemeSwitcher() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => setMounted(true), [])

  if (!mounted) return null

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-brand-text transition-colors hover:bg-white/5 hover:text-white"
        title="Trocar Tema"
      >
        <HiAdjustments className="h-5 w-5 text-brand-primary" />
        <span>Trocar Tema</span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div 
              className="fixed inset-0 z-40" 
              onClick={() => setIsOpen(false)} 
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="absolute bottom-full left-0 z-50 mb-2 w-64 rounded-2xl border border-white/10 bg-brand-card p-3 shadow-2xl backdrop-blur-xl"
            >
              <h3 className="mb-3 px-2 text-xs font-bold uppercase tracking-widest text-brand-text">Escolha seu tema</h3>
              <div className="grid grid-cols-1 gap-1">
                {THEMES.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => {
                      setTheme(t.id)
                      setIsOpen(false)
                    }}
                    className={`flex items-center justify-between rounded-xl p-2.5 transition-all hover:bg-white/5 ${
                      theme === t.id ? 'bg-white/10 ring-1 ring-white/20' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-6 w-6 overflow-hidden rounded-full">
                        <div style={{ backgroundColor: t.color }} className="h-full w-1/2" />
                        <div style={{ backgroundColor: t.secondary }} className="h-full w-1/2" />
                      </div>
                      <span className={`text-sm font-medium ${theme === t.id ? 'text-white' : 'text-brand-text'}`}>
                        {t.name}
                      </span>
                    </div>
                    {theme === t.id && <HiCheck className="h-4 w-4 text-brand-primary" />}
                  </button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
