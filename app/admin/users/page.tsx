'use client'

import { useEffect, useState, useCallback } from 'react'
import { HiSearch, HiTrash, HiShieldCheck, HiUser, HiChevronLeft, HiChevronRight } from 'react-icons/hi'
import AdminLayout from '@/components/admin/AdminLayout'
import { useSession } from 'next-auth/react'

interface AdminUser {
  id: string
  username: string
  email: string
  role: string
  emailVerified: string | null
  createdAt: string
  _count: { playlists: number }
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR')
}

export default function AdminUsersPage() {
  const { data: session } = useSession()
  const [users, setUsers] = useState<AdminUser[]>([])
  const [total, setTotal] = useState(0)
  const [pages, setPages] = useState(1)
  const [page, setPage] = useState(1)
  const [q, setQ] = useState('')
  const [loading, setLoading] = useState(true)
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)

  const fetchUsers = useCallback(async (p: number, search: string) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/users?page=${p}&q=${encodeURIComponent(search)}`)
      const json = await res.json()
      setUsers(json.data ?? [])
      setTotal(json.meta?.total ?? 0)
      setPages(json.meta?.pages ?? 1)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const t = setTimeout(() => fetchUsers(page, q), 300)
    return () => clearTimeout(t)
  }, [page, q, fetchUsers])

  async function handleDelete(id: string) {
    const res = await fetch(`/api/admin/users/${id}`, { method: 'DELETE' })
    if (!res.ok) {
      // Em caso de erro, apenas fecha o modal e recarrega a lista local
      setConfirmDelete(null)
      fetchUsers(page, q)
      return
    }

    setConfirmDelete(null)
    // Recarrega a lista para o admin e também força um reload completo da aplicação
    // para que caches locais (como playlists recentes) sejam atualizados.
    fetchUsers(page, q)
    if (typeof window !== 'undefined') {
      window.location.reload()
    }
  }

  async function toggleRole(user: AdminUser) {
    const newRole = user.role === 'ADMIN' ? 'USER' : 'ADMIN'
    await fetch(`/api/admin/users/${user.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role: newRole }),
    })
    fetchUsers(page, q)
  }

  return (
    <AdminLayout>
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white">Usuários</h2>
            <p className="text-sm text-brand-text">{total} cadastrados</p>
          </div>
          <div className="relative">
            <HiSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-text" />
            <input
              value={q}
              onChange={(e) => { setQ(e.target.value); setPage(1) }}
              placeholder="Buscar usuário..."
              className="rounded-xl bg-[#1a1a1a] pl-9 pr-4 py-2 text-sm text-white placeholder-brand-text outline-none ring-1 ring-white/10 focus:ring-brand-primary w-56"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-hidden rounded-xl bg-[#1a1a1a]">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5 text-left text-xs text-brand-text">
                <th className="px-4 py-3 font-medium">Usuário</th>
                <th className="px-4 py-3 font-medium">E-mail</th>
                <th className="px-4 py-3 font-medium hidden md:table-cell">Cadastro</th>
                <th className="px-4 py-3 font-medium hidden md:table-cell">Playlists</th>
                <th className="px-4 py-3 font-medium">Role</th>
                <th className="px-4 py-3 font-medium text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i} className="border-b border-white/5">
                    <td colSpan={6} className="px-4 py-3">
                      <div className="h-4 w-full animate-pulse rounded bg-white/10" />
                    </td>
                  </tr>
                ))
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-brand-text">
                    Nenhum usuário encontrado.
                  </td>
                </tr>
              ) : users.map((user) => (
                <tr key={user.id} className="border-b border-white/5 hover:bg-white/3 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-primary/20 text-xs font-bold text-brand-primary">
                        {user.username[0].toUpperCase()}
                      </div>
                      <span className="font-medium text-white">{user.username}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-brand-text">{user.email}</td>
                  <td className="px-4 py-3 text-brand-text hidden md:table-cell">{formatDate(user.createdAt)}</td>
                  <td className="px-4 py-3 text-brand-text hidden md:table-cell">{user._count.playlists}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${user.role === 'ADMIN' ? 'bg-brand-primary/20 text-brand-primary' : 'bg-white/10 text-brand-text'}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      {user.id !== session?.user.id && (
                        <>
                          <button
                            onClick={() => toggleRole(user)}
                            title={user.role === 'ADMIN' ? 'Rebaixar para USER' : 'Promover a ADMIN'}
                            className="rounded-lg p-1.5 text-brand-text hover:bg-brand-primary/10 hover:text-brand-primary transition-colors"
                          >
                            {user.role === 'ADMIN' ? <HiUser className="h-4 w-4" /> : <HiShieldCheck className="h-4 w-4" />}
                          </button>
                          <button
                            onClick={() => setConfirmDelete(user.id)}
                            className="rounded-lg p-1.5 text-brand-text hover:bg-red-500/10 hover:text-red-400 transition-colors"
                          >
                            <HiTrash className="h-4 w-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pages > 1 && (
          <div className="flex items-center justify-center gap-4">
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="rounded-full p-2 text-brand-text hover:bg-white/10 disabled:opacity-30">
              <HiChevronLeft className="h-5 w-5" />
            </button>
            <span className="text-sm text-brand-text">{page} / {pages}</span>
            <button onClick={() => setPage((p) => Math.min(pages, p + 1))} disabled={page === pages} className="rounded-full p-2 text-brand-text hover:bg-white/10 disabled:opacity-30">
              <HiChevronRight className="h-5 w-5" />
            </button>
          </div>
        )}
      </div>

      {/* Delete confirmation modal */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
          <div className="rounded-2xl bg-[#1a1a1a] p-6 w-full max-w-sm">
            <h3 className="text-lg font-bold text-white mb-2">Excluir usuário?</h3>
            <p className="text-sm text-brand-text mb-6">Essa ação é permanente e removerá o usuário e todas as suas playlists.</p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmDelete(null)} className="flex-1 rounded-full border border-white/10 py-2 text-sm font-semibold text-white hover:bg-white/5">
                Cancelar
              </button>
              <button onClick={() => handleDelete(confirmDelete)} className="flex-1 rounded-full bg-red-500 py-2 text-sm font-bold text-white hover:bg-red-600">
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}
