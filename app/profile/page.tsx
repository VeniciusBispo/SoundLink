'use client'

import { useState, useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import MainLayout from '@/components/layout/MainLayout'
import PlaylistGrid from '@/components/playlist/PlaylistGrid'
import Button from '@/components/ui/Button'
import { useMyPlaylists } from '@/hooks/usePlaylist'
import { useUIStore } from '@/store/uiStore'
import { getProfile, updateProfile } from '@/services/authService'
import {
  HiMusicNote, HiUser, HiPencil, HiLockClosed, HiCollection,
  HiCheckCircle, HiExclamationCircle, HiLogout, HiEye, HiEyeOff,
} from 'react-icons/hi'

interface Profile {
  id: string
  username: string
  email: string
  avatar?: string | null
  createdAt: string
  _count: { playlists: number }
}

type Tab = 'perfil' | 'seguranca' | 'playlists'

function Alert({ type, msg }: { type: 'success' | 'error'; msg: string }) {
  return (
    <div className={`flex items-center gap-2 rounded-xl px-4 py-3 text-sm ${type === 'success' ? 'bg-spotify-green/10 text-spotify-green' : 'bg-red-500/10 text-red-400'}`}>
      {type === 'success' ? <HiCheckCircle className="h-4 w-4 flex-shrink-0" /> : <HiExclamationCircle className="h-4 w-4 flex-shrink-0" />}
      {msg}
    </div>
  )
}

export default function ProfilePage() {
  const { data: session, status, update: updateSession } = useSession()
  const router = useRouter()
  const { playlists } = useMyPlaylists()
  const openCreatePlaylistModal = useUIStore((s) => s.openCreatePlaylistModal)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [tab, setTab] = useState<Tab>('perfil')

  // Profile edit state
  const [username, setUsername] = useState('')
  const [avatar, setAvatar] = useState('')
  const [profileMsg, setProfileMsg] = useState<{ type: 'success' | 'error'; msg: string } | null>(null)
  const [savingProfile, setSavingProfile] = useState(false)

  // Password state
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [passwordMsg, setPasswordMsg] = useState<{ type: 'success' | 'error'; msg: string } | null>(null)
  const [savingPassword, setSavingPassword] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') { router.push('/login'); return }
    if (status === 'authenticated') {
      getProfile().then((p) => {
        setProfile(p)
        setUsername(p.username)
        setAvatar(p.avatar ?? '')
      }).catch(console.error)
    }
  }, [status, router])

  async function handleSaveProfile() {
    if (!username.trim()) return
    setSavingProfile(true)
    setProfileMsg(null)
    try {
      const updated = await updateProfile({ username: username.trim(), avatar: avatar.trim() || undefined })
      setProfile((prev) => prev ? { ...prev, ...updated } : prev)
      await updateSession({ name: updated.username })
      setProfileMsg({ type: 'success', msg: 'Perfil atualizado com sucesso!' })
    } catch (e: unknown) {
      setProfileMsg({ type: 'error', msg: e instanceof Error ? e.message : 'Erro ao salvar' })
    } finally {
      setSavingProfile(false)
    }
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault()
    setPasswordMsg(null)
    if (newPassword !== confirmPassword) {
      setPasswordMsg({ type: 'error', msg: 'As senhas não coincidem' }); return
    }
    if (newPassword.length < 8) {
      setPasswordMsg({ type: 'error', msg: 'A nova senha deve ter pelo menos 8 caracteres' }); return
    }
    setSavingPassword(true)
    try {
      const res = await fetch('/api/profile/password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error)
      setPasswordMsg({ type: 'success', msg: 'Senha alterada com sucesso!' })
      setCurrentPassword(''); setNewPassword(''); setConfirmPassword('')
    } catch (e: unknown) {
      setPasswordMsg({ type: 'error', msg: e instanceof Error ? e.message : 'Erro ao alterar senha' })
    } finally {
      setSavingPassword(false)
    }
  }

  if (status === 'loading' || !profile) {
    return (
      <MainLayout>
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-white border-t-transparent" />
        </div>
      </MainLayout>
    )
  }

  const memberSince = new Date(profile.createdAt).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'perfil', label: 'Perfil', icon: <HiUser className="h-4 w-4" /> },
    { id: 'seguranca', label: 'Segurança', icon: <HiLockClosed className="h-4 w-4" /> },
    { id: 'playlists', label: 'Minhas Playlists', icon: <HiCollection className="h-4 w-4" /> },
  ]

  return (
    <MainLayout>
      {/* Hero */}
      <div className="flex flex-col gap-6 bg-gradient-to-b from-indigo-900/40 to-transparent px-6 py-8 sm:flex-row sm:items-end">
        <div className="flex h-28 w-28 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 shadow-xl overflow-hidden">
          {profile.avatar ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={profile.avatar} alt={profile.username} className="h-full w-full object-cover" />
          ) : (
            <HiUser className="h-14 w-14 text-white" />
          )}
        </div>
        <div className="flex-1">
          <p className="mb-0.5 text-xs font-semibold uppercase tracking-widest text-white/60">Perfil</p>
          <h1 className="text-3xl font-black text-white sm:text-4xl">{profile.username}</h1>
          <p className="mt-1 text-sm text-spotify-text">{profile.email}</p>
          <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-spotify-text">
            <span><HiCollection className="mr-1 inline h-4 w-4" />{profile._count.playlists} playlists</span>
            <span className="text-white/30">·</span>
            <span>Membro desde {memberSince}</span>
          </div>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: window.location.origin })}
          className="flex items-center gap-2 rounded-xl border border-white/10 px-4 py-2 text-sm text-spotify-text transition hover:border-white/30 hover:text-white"
        >
          <HiLogout className="h-4 w-4" />
          Sair
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-white/10 px-6">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
              tab === t.id
                ? 'border-spotify-green text-white'
                : 'border-transparent text-spotify-text hover:text-white'
            }`}
          >
            {t.icon}
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="px-6 py-8 max-w-xl">

        {/* ——— PERFIL ——— */}
        {tab === 'perfil' && (
          <div className="flex flex-col gap-5">
            <h2 className="text-lg font-bold text-white">Informações do perfil</h2>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm text-spotify-text">Nome de usuário</label>
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="rounded-xl bg-spotify-card px-4 py-3 text-sm text-white placeholder-spotify-text/50 outline-none ring-1 ring-white/10 focus:ring-spotify-green transition"
                placeholder="seunome"
                maxLength={30}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm text-spotify-text">URL do avatar <span className="text-white/30">(opcional)</span></label>
              <input
                value={avatar}
                onChange={(e) => setAvatar(e.target.value)}
                className="rounded-xl bg-spotify-card px-4 py-3 text-sm text-white placeholder-spotify-text/50 outline-none ring-1 ring-white/10 focus:ring-spotify-green transition"
                placeholder="https://..."
              />
              {avatar && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={avatar} alt="preview" className="mt-1 h-16 w-16 rounded-full object-cover border border-white/10" />
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm text-spotify-text">E-mail</label>
              <input
                value={profile.email}
                disabled
                className="rounded-xl bg-spotify-card/50 px-4 py-3 text-sm text-spotify-text/60 outline-none ring-1 ring-white/5 cursor-not-allowed"
              />
              <p className="text-xs text-spotify-text/40">O e-mail não pode ser alterado</p>
            </div>

            {profileMsg && <Alert type={profileMsg.type} msg={profileMsg.msg} />}

            <button
              onClick={handleSaveProfile}
              disabled={savingProfile || !username.trim()}
              className="flex items-center justify-center gap-2 rounded-xl bg-spotify-green px-6 py-3 text-sm font-semibold text-black transition hover:brightness-110 disabled:opacity-50"
            >
              <HiPencil className="h-4 w-4" />
              {savingProfile ? 'Salvando...' : 'Salvar alterações'}
            </button>
          </div>
        )}

        {/* ——— SEGURANÇA ——— */}
        {tab === 'seguranca' && (
          <form onSubmit={handleChangePassword} className="flex flex-col gap-5">
            <h2 className="text-lg font-bold text-white">Alterar senha</h2>

            {[
              { label: 'Senha atual', value: currentPassword, set: setCurrentPassword, show: showCurrent, toggle: () => setShowCurrent((v) => !v) },
              { label: 'Nova senha', value: newPassword, set: setNewPassword, show: showNew, toggle: () => setShowNew((v) => !v) },
              { label: 'Confirmar nova senha', value: confirmPassword, set: setConfirmPassword, show: showConfirm, toggle: () => setShowConfirm((v) => !v) },
            ].map(({ label, value, set, show, toggle }) => (
              <div key={label} className="flex flex-col gap-1.5">
                <label className="text-sm text-spotify-text">{label}</label>
                <div className="relative">
                  <input
                    type={show ? 'text' : 'password'}
                    value={value}
                    onChange={(e) => set(e.target.value)}
                    required
                    className="w-full rounded-xl bg-spotify-card px-4 py-3 pr-12 text-sm text-white placeholder-spotify-text/50 outline-none ring-1 ring-white/10 focus:ring-spotify-green transition"
                    placeholder="••••••••"
                  />
                  <button type="button" onClick={toggle} className="absolute right-3 top-1/2 -translate-y-1/2 text-spotify-text hover:text-white">
                    {show ? <HiEyeOff className="h-5 w-5" /> : <HiEye className="h-5 w-5" />}
                  </button>
                </div>
              </div>
            ))}

            <div className="rounded-xl bg-spotify-card/50 px-4 py-3 text-xs text-spotify-text space-y-1">
              <p className="font-medium text-white/60 mb-1">Requisitos da senha:</p>
              <p className={newPassword.length >= 8 ? 'text-spotify-green' : ''}>• Mínimo 8 caracteres</p>
              <p className={newPassword === confirmPassword && confirmPassword ? 'text-spotify-green' : ''}>• As senhas devem coincidir</p>
            </div>

            {passwordMsg && <Alert type={passwordMsg.type} msg={passwordMsg.msg} />}

            <button
              type="submit"
              disabled={savingPassword}
              className="flex items-center justify-center gap-2 rounded-xl bg-spotify-green px-6 py-3 text-sm font-semibold text-black transition hover:brightness-110 disabled:opacity-50"
            >
              <HiLockClosed className="h-4 w-4" />
              {savingPassword ? 'Salvando...' : 'Alterar senha'}
            </button>
          </form>
        )}

        {/* ——— PLAYLISTS ——— */}
        {tab === 'playlists' && (
          <div className="max-w-none">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-lg font-bold text-white">{playlists.length} playlists</h2>
              <Button onClick={openCreatePlaylistModal} size="sm">Nova playlist</Button>
            </div>
            <PlaylistGrid playlists={playlists} />
          </div>
        )}

      </div>
    </MainLayout>
  )
}
