import MainLayout from '@/components/layout/MainLayout'
import { HiFire, HiUserGroup, HiSave, HiCheckCircle } from 'react-icons/hi'

export const metadata = {
  title: 'Como Funciona o SoundLink - Guia do Usuário',
  description: 'Aprenda como tirar o máximo de proveito do SoundLink. Veja como criar playlists, encontrar músicas e aproveitar a melhor experiência de streaming.',
}

export default function ComoFuncionaPage() {
  const steps = [
    {
      icon: <HiSave className="h-8 w-8 text-brand-primary" />,
      title: 'Crie sua Conta',
      description: 'Registre-se ou entre para começar a salvar suas coleções musicais com segurança e privacidade.',
    },
    {
      icon: <HiFire className="h-8 w-8 text-orange-500" />,
      title: 'Busque no YouTube',
      description: 'Nossa integração permite que você adicione qualquer vídeo do YouTube diretamente à sua playlist em segundos.',
    },
    {
      icon: <HiUserGroup className="h-8 w-8 text-brand-secondary" />,
      title: 'Comunidade Ativa',
      description: 'Compartilhe suas playlists com amigos ou explore o que a comunidade SoundLink está ouvindo em tempo real.',
    },
    {
      icon: <HiCheckCircle className="h-8 w-8 text-teal-500" />,
      title: 'Organize do Seu Jeito',
      description: 'Crie pastas, arraste e solte músicas, alterne entre os modos de exibição e tenha controle total sobre seu som.',
    },
  ]

  return (
    <MainLayout>
      <div className="mx-auto max-w-5xl px-4 py-12 text-brand-text">
        <h1 className="mb-4 text-center text-4xl font-extrabold text-white">Como Funciona o SoundLink</h1>
        <p className="mb-12 text-center text-xl">Tudo o que você precisa saber para dominar sua experiência musical.</p>

        <div className="grid gap-8 md:grid-cols-2">
          {steps.map((step, idx) => (
            <div key={idx} className="flex gap-4 rounded-2xl bg-brand-card p-6 border border-white/5 shadow-xl transition-all hover:border-white/10">
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-white/5">
                {step.icon}
              </div>
              <div>
                <h3 className="mb-2 text-xl font-bold text-white">{step.title}</h3>
                <p className="leading-relaxed leading-relaxed">{step.description}</p>
              </div>
            </div>
          ))}
        </div>

        <section className="mt-16 rounded-3xl bg-gradient-to-r from-brand-primary/10 via-brand-card to-brand-primary/5 p-10 border border-white/5">
          <h2 className="mb-6 text-3xl font-extrabold text-white">Recursos Avançados</h2>
          <div className="space-y-8 text-lg">
            <div>
              <h3 className="mb-2 text-xl font-bold text-white underline decoration-brand-primary/40 underline-offset-4">Playlists Públicas vs. Privadas</h3>
              <p>
                Escolha quem pode ver o seu gosto musical. Configure suas playlists como públicas para que 
                apareçam na aba <strong>Explorar</strong> para toda a comunidade, ou mantenha-as privadas 
                apenas para seu uso pessoal. Você tem total controle sobre sua visibilidade.
              </p>
            </div>
            <div>
              <h3 className="mb-2 text-xl font-bold text-white underline decoration-brand-primary/40 underline-offset-4">Mini-Games Musicais</h3>
              <p>
                Tire uma folga do player e desafie seus conhecimentos musicais! O SoundLink conta com 
                uma seção dedicada de jogos onde você pode testar seus ouvidos no <strong>Blind Test</strong> 
                ou até mesmo tocar em nosso <strong>Piano Virtual</strong> exclusivo. 
              </p>
            </div>
            <div>
              <h3 className="mb-2 text-xl font-bold text-white underline decoration-brand-primary/40 underline-offset-4">Sincronização entre Dispositivos</h3>
              <p>
                Como usamos uma infraestrutura em nuvem robusta, suas playlists estão sempre com você. Comece a criar 
                suas coleções no computador e termine de ouvir no seu tablet ou celular. Tudo é sincronizado 
                automaticamente assim que você acessa sua conta.
              </p>
            </div>
          </div>
        </section>
      </div>
    </MainLayout>
  )
}
