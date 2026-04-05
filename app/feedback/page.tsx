'use client'

import { useState } from 'react'
import MainLayout from '@/components/layout/MainLayout'
import { HiChatAlt2, HiSparkles, HiLightBulb, HiCheckCircle } from 'react-icons/hi'
import { motion } from 'framer-motion'

export default function FeedbackPage() {
  const [formData, setFormData] = useState({
    message: '',
    email: '',
  })
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('loading')
    setErrorMessage('')

    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const result = await res.json()

      if (res.ok) {
        setStatus('success')
        setFormData({ message: '', email: '' })
      } else {
        setStatus('error')
        setErrorMessage(result.error || 'Erro ao enviar feedback')
      }
    } catch (err) {
      setStatus('error')
      setErrorMessage('Erro de conexão')
    }
  }

  return (
    <MainLayout>
      <div className="mx-auto max-w-4xl px-4 py-16 text-brand-text">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h1 className="mb-4 text-5xl font-extrabold tracking-tight text-white md:text-6xl">
            Sua voz molda o <span className="bg-gradient-to-r from-brand-primary to-brand-secondary bg-clip-text text-transparent">SoundLink</span>
          </h1>
          <p className="mx-auto max-w-2xl text-lg opacity-80 md:text-xl">
            Queremos construir o melhor player de música do mundo com você. 
            Compartilhe suas ideias, críticas ou sugestões.
          </p>
        </motion.div>

        <div className="mt-16 grid gap-8 md:grid-cols-2">
          {/* Info Side */}
          <div className="space-y-6">
            <div className="rounded-3xl bg-brand-card p-8 border border-white/5 shadow-2xl">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-primary/10 text-brand-primary">
                <HiChatAlt2 className="h-8 w-8" />
              </div>
              <h3 className="mb-2 text-xl font-bold text-white">Feedback Real</h3>
              <p className="opacity-70">Lemos todas as mensagens. Suas sugestões entram diretamente no nosso roteiro de desenvolvimento.</p>
            </div>

            <div className="rounded-3xl bg-brand-card p-8 border border-white/5 shadow-2xl">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-secondary/10 text-brand-secondary">
                <HiLightBulb className="h-8 w-8" />
              </div>
              <h3 className="mb-2 text-xl font-bold text-white">Inovação Constante</h3>
              <p className="opacity-70">Adoramos ideias malucas! Se você pensou em um novo recurso, conte para nós.</p>
            </div>

            <div className="flex items-center gap-2 p-4 text-sm font-medium text-white/40">
              <HiSparkles className="h-4 w-4" />
              <span>Processado de forma 100% segura e privada.</span>
            </div>
          </div>

          {/* Form Side */}
          <div className="rounded-3xl bg-brand-dark p-8 border border-brand-primary/20 shadow-[0_0_50px_-12px_rgba(99,102,241,0.2)]">
            {status === 'success' ? (
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="flex h-full flex-col items-center justify-center text-center space-y-4"
              >
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-brand-primary/20 text-brand-primary">
                  <HiCheckCircle className="h-12 w-12" />
                </div>
                <h2 className="text-2xl font-bold text-white">Feedback Recebido!</h2>
                <p>Obrigado por nos ajudar a crescer. Nossa equipe analisará sua mensagem em breve.</p>
                <button
                  onClick={() => setStatus('idle')}
                  className="mt-4 rounded-full bg-white/10 px-8 py-2 font-bold text-white transition hover:bg-white/20"
                >
                  Enviar outro
                </button>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label htmlFor="message" className="text-sm font-bold text-white/80">O que você tem em mente?</label>
                  <textarea
                    id="message"
                    required
                    rows={6}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full rounded-2xl bg-white/5 p-4 text-white outline-none ring-1 ring-white/10 transition focus:ring-2 focus:ring-brand-primary"
                    placeholder="Sua sugestão, erro encontrado ou elogio..."
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-bold text-white/80">E-mail (opcional)</label>
                  <input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full rounded-xl bg-white/5 px-4 py-3 text-white outline-none ring-1 ring-white/10 transition focus:ring-2 focus:ring-brand-primary"
                    placeholder="seu@email.com"
                  />
                  <p className="text-xs opacity-40 italic font-medium">Deixe seu e-mail se desejar receber uma resposta nossa.</p>
                </div>

                {status === 'error' && (
                  <p className="text-sm font-bold text-rose-500 bg-rose-500/10 p-3 rounded-lg border border-rose-500/20">
                    ⚠️ {errorMessage}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={status === 'loading'}
                  className="w-full rounded-full bg-gradient-to-r from-brand-primary to-brand-secondary py-4 font-bold text-white shadow-lg transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:grayscale"
                >
                  {status === 'loading' ? 'Enviando...' : 'Enviar Feedback Agora'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
