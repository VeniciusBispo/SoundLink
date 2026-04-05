import MainLayout from '@/components/layout/MainLayout'
import Link from 'next/link'

export const metadata = {
  title: 'Sobre o SoundLink – Nossa História e Missão',
  description: 'Conheça o SoundLink, a plataforma de música que coloca você no controle. Descubra nossa missão de tornar a música acessível e personalizada para todos.',
}

export default function SobrePage() {
  return (
    <MainLayout>
      <div className="mx-auto max-w-4xl px-4 py-12 text-brand-text">
        <h1 className="mb-8 text-4xl font-extrabold text-white">Sobre o SoundLink</h1>
        
        <div className="space-y-8 text-lg leading-relaxed">
          <section>
            <h2 className="mb-4 text-2xl font-bold text-white">Nossa Missão</h2>
            <p>
              O SoundLink nasceu com um propósito simples: liberar o poder da sua biblioteca musical. 
              Acreditamos que a música é uma experiência pessoal e universal, e que todos devem ter as 
              ferramentas certas para organizar, descobrir e compartilhar suas faixas favoritas sem barreiras.
            </p>
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-bold text-white">Como Tudo Começou</h2>
            <p>
              A ideia do SoundLink surgiu da própria necessidade do dia a dia. Durante vivências em grupos 
              de esportes, como o vôlei, e em longas sessões de jogos online em call, identificamos um 
              problema recorrente: a dificuldade de criar uma atmosfera musical colaborativa. 
            </p>
            <p className="mt-4">
              Sentíamos falta de um espaço onde cada membro tivesse a liberdade de colocar suas músicas 
              para todos ouvirem, construindo uma playlist única que refletisse o gosto de todo o grupo. 
              Foi assim que o SoundLink ganhou vida, trazendo o melhor do YouTube para criar uma experiência 
              onde a trilha sonora é moldada pela comunidade, para a comunidade.
            </p>
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-bold text-white">Por que o SoundLink?</h2>
            <p>
              Em um mundo dominado por algoritmos, o SoundLink coloca <strong>você</strong> no centro. 
              Nossa plataforma permite que você combine a vastidão do YouTube com a elegância de um 
              player de música moderno. Seja para criar a playlist perfeita para o treino ou para 
              salvar raridades musicais que só existem no YouTube, o SoundLink é o seu santuário sonoro.
            </p>
          </section>

          <div className="my-10 rounded-2xl bg-gradient-to-br from-brand-primary/20 to-brand-card p-8 border border-white/5">
            <h3 className="mb-2 text-xl font-bold text-white italic">"A música não tem fronteiras, e agora o seu player também não."</h3>
            <p className="text-sm opacity-80">— Equipe SoundLink</p>
          </div>

          <section>
            <h2 className="mb-4 text-2xl font-bold text-white">Tecnologia e Inovação</h2>
            <p>
              Desenvolvido com as tecnologias mais modernas do mercado, como Next.js 14, Prisma e Tailwind CSS, 
              o SoundLink oferece uma experiência veloz e fluida em qualquer dispositivo.
            </p>
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-bold text-white">Compromisso com o Usuário</h2>
            <p>
              Sua privacidade é nossa prioridade. O SoundLink foi projetado para ser seguro, transparente 
              e respeitar os dados dos usuários. Não vendemos suas informações e trabalhamos constantemente 
              para melhorar a plataforma com base no feedback da nossa comunidade.
            </p>
          </section>

          <div className="pt-8 text-center">
            <Link 
              href="/register" 
              className="inline-block rounded-full bg-brand-primary px-8 py-3 text-lg font-bold text-black transition-transform hover:scale-105 active:scale-95"
            >
              Comece a usar o SoundLink agora
            </Link>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
