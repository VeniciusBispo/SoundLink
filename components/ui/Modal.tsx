'use client'

import { useEffect, useRef } from 'react'
import { HiX } from 'react-icons/hi'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
}

export default function Modal({ isOpen, onClose, title, children }: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null)

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose()
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'modal-title' : undefined}
        className="relative w-full max-w-md rounded-xl bg-spotify-card p-6 shadow-2xl"
      >
        {/* Header */}
        <div className="mb-5 flex items-start justify-between">
          {title && (
            <h2 id="modal-title" className="text-xl font-bold text-white">
              {title}
            </h2>
          )}
          <button
            onClick={onClose}
            className="ml-auto rounded-full p-1 text-spotify-text hover:bg-spotify-hover hover:text-white transition-colors"
            aria-label="Close modal"
          >
            <HiX className="h-5 w-5" />
          </button>
        </div>

        {children}
      </div>
    </div>
  )
}
