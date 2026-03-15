'use client'

import { useEffect, useState, useCallback } from 'react'
import { HiChatAlt2, HiMail, HiCalendar, HiTrash, HiChevronLeft, HiChevronRight } from 'react-icons/hi'
import AdminLayout from '@/components/admin/AdminLayout'

interface FeedbackItem {
  id: string
  message: string
  email: string | null
  createdAt: string
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

export default function AdminFeedbackPage() {
  const [items, setItems] = useState<FeedbackItem[]>([])
  const [total, setTotal] = useState(0)
  const [pages, setPages] = useState(1)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)

  const fetchItems = useCallback(async (p: number) => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/feedback?page=' + p)
      const json = await res.json()
      setItems(json.data ?? [])
      setTotal(json.meta?.total ?? 0)
      setPages(json.meta?.pages ?? 1)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchItems(page) }, [page, fetchItems])

  async function handleDelete(id: string) {
    setDeleting(id)
    await fetch('/api/admin/feedback?id=' + id, { method: 'DELETE' })
    setDeleting(null)
    fetchItems(page)
  }

  return (
    <AdminLayout>
      <div className="flex flex-col gap-4">
        <div>
          <h2 className="text-xl font-bold text-white">Feedbacks</h2>
          <p className="text-sm text-spotify-text">{total} mensagens recebidas</p>
        </div>

        {loading ? (
          <div className="flex flex-col gap-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-24 animate-pulse rounded-xl bg-[#1a1a1a]" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-16 text-center">
            <HiChatAlt2 className="h-14 w-14 text-white/10" />
            <p className="text-spotify-text">Nenhum feedback recebido ainda.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {items.map((item) => (
              <div key={item.id} className="group rounded-xl bg-[#1a1a1a] p-4 flex gap-3">
                <div className="flex-1 flex flex-col gap-2">
                  <p className="text-sm text-white leading-relaxed whitespace-pre-wrap">{item.message}</p>
                  <div className="flex flex-wrap items-center gap-4">
                    {item.email && (
                      <span className="flex items-center gap-1.5 text-xs text-spotify-green">
                        <HiMail className="h-3.5 w-3.5" />{item.email}
                      </span>
                    )}
                    <span className="flex items-center gap-1.5 text-xs text-spotify-text">
                      <HiCalendar className="h-3.5 w-3.5" />{formatDate(item.createdAt)}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(item.id)}
                  disabled={deleting === item.id}
                  className="flex-shrink-0 rounded-lg p-2 text-spotify-text opacity-0 group-hover:opacity-100 hover:bg-red-500/10 hover:text-red-400 transition-all disabled:opacity-50"
                >
                  <HiTrash className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        {pages > 1 && (
          <div className="flex items-center justify-center gap-4 py-2">
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="rounded-full p-2 text-spotify-text hover:bg-white/10 disabled:opacity-30">
              <HiChevronLeft className="h-5 w-5" />
            </button>
            <span className="text-sm text-spotify-text">{page} / {pages}</span>
            <button onClick={() => setPage((p) => Math.min(pages, p + 1))} disabled={page === pages} className="rounded-full p-2 text-spotify-text hover:bg-white/10 disabled:opacity-30">
              <HiChevronRight className="h-5 w-5" />
            </button>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
