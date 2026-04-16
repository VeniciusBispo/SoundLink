import MainLayout from '@/components/layout/MainLayout'
import { HiMail, HiChatAlt2, HiQuestionMarkCircle } from 'react-icons/hi'

export const metadata = {
  title: 'Contato – SoundLink',
  description: 'Entre em contato com a equipe do SoundLink para suporte, sugestões ou parcerias.',
}

export default function ContatoPage() {
  return (
    <MainLayout>
      <div className="mx-auto max-w-4xl px-4 py-12 text-brand-text">
        <div className="text-center mb-16">
          <h1 className="mb-4 text-4xl font-extrabold text-white sm:text-5xl">Como podemos ajudar?</h1>
          <p className="text-lg text-brand-text/80">
            Estamos sempre abertos a ouvir seu feedback, sugestões ou resolver qualquer problema técnico.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3 mb-16">
          <div className="flex flex-col items-center p-8 rounded-3xl bg-brand-card border border-white/5 text-center transition-transform hover:scale-105">
            <div className="w-12 h-12 flex items-center justify-center rounded-2xl bg-brand-primary/10 text-brand-primary mb-4">
              <HiMail className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">E-mail</h3>
            <p className="text-sm mb-4">Para suporte direto e questões administrativas.</p>
            <a href="mailto:suporte@soundlink.com" className="text-brand-primary font-bold hover:underline">
              suporte@soundlink.com
            </a>
          </div>

          <div className="flex flex-col items-center p-8 rounded-3xl bg-brand-card border border-white/5 text-center transition-transform hover:scale-105">
            <div className="w-12 h-12 flex items-center justify-center rounded-2xl bg-brand-secondary/10 text-brand-secondary mb-4">
              <HiChatAlt2 className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Comunidade</h3>
            <p className="text-sm mb-4">Participe das nossas redes e interaja com outros usuários.</p>
            <span className="text-brand-secondary font-bold">@soundlink_app</span>
          </div>

          <div className="flex flex-col items-center p-8 rounded-3xl bg-brand-card border border-white/5 text-center transition-transform hover:scale-105">
            <div className="w-12 h-12 flex items-center justify-center rounded-2xl bg-brand-primary/10 text-brand-primary mb-4">
              <HiQuestionMarkCircle className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">FAQ</h3>
            <p className="text-sm mb-4">Veja as dúvidas mais comuns de outros usuários.</p>
            <button className="text-brand-primary font-bold hover:underline">Ver ajuda</button>
          </div>
        </div>

        <div className="rounded-3xl bg-gradient-to-br from-brand-card to-black p-8 md:p-12 border border-white/5 shadow-2xl">
          <h2 className="text-3xl font-bold text-white mb-8 text-center">Envie uma mensagem</h2>
          <form className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium text-white/60 ml-1">Nome</label>
                <input 
                  type="text" 
                  className="w-full px-5 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-brand-primary focus:outline-none text-white transition-colors"
                  placeholder="Seu nome"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-white/60 ml-1">E-mail</label>
                <input 
                  type="email" 
                  className="w-full px-5 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-brand-primary focus:outline-none text-white transition-colors"
                  placeholder="seu@email.com"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-white/60 ml-1">Assunto</label>
              <select className="w-full px-5 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-brand-primary focus:outline-none text-white transition-colors appearance-none">
                <option value="suporte">Suporte Técnico</option>
                <option value="feedback">Feedback / Sugestão</option>
                <option value="parceria">Parcerias</option>
                <option value="outro">Outro</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-white/60 ml-1">Mensagem</label>
              <textarea 
                rows={5}
                className="w-full px-5 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-brand-primary focus:outline-none text-white transition-colors resize-none"
                placeholder="Como podemos ajudar?"
              />
            </div>
            <button 
              type="submit"
              className="w-full py-4 rounded-xl bg-brand-primary text-black font-extrabold text-lg transition-transform hover:scale-[1.01] active:scale-95 shadow-lg shadow-brand-primary/20"
            >
              Enviar Mensagem
            </button>
          </form>
        </div>
      </div>
    </MainLayout>
  )
}
