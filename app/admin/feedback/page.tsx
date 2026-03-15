'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { HiChat, HiMail, HiCalendar, HiChevronLeft, HiChevronRight } from 'react-icons/hi'
import MainLayout from '@/components/layout/MainLayout'

interface FeedbackItem {
  id: string
  message: string
  email: string | null
  createdAt: string
}

interface Meta {
  total: number
  page: number
  pages: number
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function AdminFeedbackPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [items, setItems] = useState<FeedbackItem[]>([])
  const [meta, setMeta] = useState<Meta>({ total: 0, page: 1, pages: 1 })
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/login')
    }
  }, [status, router])

  useEffect(() => {
    if (status !== 'authenticated') return
    setLoading(true)
    fetch(`/api/feedback/list?page=${page}`)
      .then((r) => r.json())
      .then((json) => {
        setItems(json.data ?? [])
        setMeta(json.meta ?? { total: 0, page: 1, pages: 1 })
      })
      .finally(() => setLoading(false))
  }, [page, status])

  if (status === 'loading') return null

  return (
    <MainLayout>
      <div className="flex flex-col gap-6 py-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-spotify-green/20">
            <HiChat className="h-5 w-5 text-spotify-green" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Feedbacks recebidos</h1>
            {!loading && (
              <p className="text-sm text-spotify-text">{meta.total} mensagens</p>
            )}
          </div>
        </div>

        {/* List */}
        {loading ? (
          <div className="flex flex-col gap-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-24 animate-pulse rounded-xl bg-spotify-card" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-16 text-center">
            <HiChat className="h-14 w-14 text-spotify-text/30" />
            <p className="text-spotify-text">Nenhum feedback recebido ainda.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {items.map((item) => (
              <div
                key={item.id}
                className="rounded-xl bg-spotify-card p-4 flex flex-col gap-2"
              >
                <p className="text-sm text-white leading-relaxed whitespace-pre-wrap">
                  {item.message}
                </p>
                <div className="flex flex-wrap items-center gap-4 pt-1">
                  {item.email && (
                    <span className="flex items-center gap-1.5 text-xs text-spotify-green">
                      <HiMail className="h-3.5 w-3.5" />
                      {item.email}
                    </span>
                  )}
                  <span className="flex items-center gap-1.5 text-xs text-spotify-text">
                    <HiCalendar className="h-3.5 w-3.5" />
                    {formatDate(item.createdAt)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {meta.pages > 1 && (
          <div className="flex items-center justify-center gap-4 py-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="rounded-full p-2 text-spotify-text hover:bg-white/10 hover:text-white disabled:opacity-30"
            >
              <HiChevronLeft className="h-5 w-5" />
            </button>
            <span className="text-sm text-spotify-text">
              Página {page} de {meta.pages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(meta.pages, p + 1))}
              disabled={page === meta.pages}
              className="rounded-full p-2 text-spotify-text hover:bg-white/10 hover:text-white disabled:opacity-30"
            >
              <HiChevronRight className="h-5 w-5" />
            </button>
          </div>
        )}
      </div>
    </MainLayout>
  )
}
