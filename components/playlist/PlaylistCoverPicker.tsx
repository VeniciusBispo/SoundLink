'use client'

import { useMemo, useState } from 'react'

type Props = {
  value: string
  onChange: (value: string) => void
}

function isLikelyImageSrc(v: string) {
  return /^data:image\//.test(v) || /^https?:\/\//.test(v) || v.startsWith('/')
}

export default function PlaylistCoverPicker({ value, onChange }: Props) {
  const [urlInput, setUrlInput] = useState('')

  const preview = useMemo(() => {
    const v = value?.trim()
    if (!v) return null
    if (isLikelyImageSrc(v)) return { kind: 'image' as const, src: v }
    return { kind: 'emoji' as const, emoji: v }
  }, [value])

  const handleFile = (file: File | undefined) => {
    if (!file) return
    if (!file.type.startsWith('image/')) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      if (typeof ev.target?.result === 'string') onChange(ev.target.result)
    }
    reader.readAsDataURL(file)
  }

  const applyUrl = () => {
    const v = urlInput.trim()
    if (!v) return
    onChange(v)
    setUrlInput('')
  }

  return (
    <div className="flex flex-col gap-3">
      {preview && (
        <div className="flex items-center gap-3">
          <div className="relative h-16 w-16 overflow-hidden rounded-lg bg-spotify-hover">
            {preview.kind === 'image' ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={preview.src} alt="Capa da playlist" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-3xl">
                {preview.emoji}
              </div>
            )}
          </div>
          <button
            type="button"
            className="text-sm font-semibold text-red-400 hover:text-red-300"
            onClick={() => onChange('')}
          >
            Remover capa
          </button>
        </div>
      )}

      <div className="flex flex-col gap-2">
        <label className="text-xs text-spotify-text">Enviar imagem</label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => handleFile(e.target.files?.[0])}
          className="block w-full text-sm text-spotify-text file:mr-3 file:rounded-lg file:border-0 file:bg-spotify-hover file:px-3 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-spotify-card"
        />
        <p className="text-[11px] leading-relaxed text-spotify-text/80">
          Dica: imagens muito grandes podem deixar a playlist pesada. Preferível usar um link (URL) quando possível.
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-xs text-spotify-text">Ou cole uma URL de imagem</label>
        <div className="flex gap-2">
          <input
            type="url"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            placeholder="https://…"
            className="w-full rounded-xl bg-spotify-hover px-3 py-2.5 text-sm text-white placeholder-spotify-text/50 focus:outline-none focus:ring-2 focus:ring-spotify-green"
          />
          <button
            type="button"
            onClick={applyUrl}
            className="flex-shrink-0 rounded-xl bg-spotify-green px-4 py-2.5 text-sm font-bold text-black active:scale-[0.99]"
          >
            Usar
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-xs text-spotify-text">Ou use um emoji</label>
        <input
          type="text"
          inputMode="text"
          value={!isLikelyImageSrc(value) ? value : ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Ex: 🎵"
          className="w-full rounded-xl bg-spotify-hover px-3 py-2.5 text-sm text-white placeholder-spotify-text/50 focus:outline-none focus:ring-2 focus:ring-spotify-green"
        />
      </div>
    </div>
  )
}

