'use client'

import MainLayout from '@/components/layout/MainLayout'

export default function TermsPage() {
  return (
    <MainLayout>
      <div className="mx-auto max-w-3xl px-4 py-10 text-spotify-text">
        <h1 className="mb-6 text-3xl font-bold text-white">Termos de Uso</h1>
        <p className="mb-4 text-sm text-spotify-text/60">Última atualização: março de 2026</p>

        <section className="mb-8">
          <h2 className="mb-3 text-xl font-semibold text-white">1. Aceitação dos Termos</h2>
          <p className="leading-relaxed">
            Ao acessar e usar o SoundLink, você concorda em cumprir e estar vinculado a estes Termos
            de Uso. Se você não concordar com qualquer parte destes termos, não deve usar nosso
            serviço.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="mb-3 text-xl font-semibold text-white">2. Descrição do Serviço</h2>
          <p className="leading-relaxed">
            O SoundLink é uma plataforma de gerenciamento de playlists que utiliza a API pública do
            YouTube para reprodução de conteúdo audiovisual. Não hospedamos arquivos de áudio ou
            vídeo em nossos servidores.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="mb-3 text-xl font-semibold text-white">3. Uso Permitido</h2>
          <p className="leading-relaxed">
            Você concorda em usar o serviço apenas para fins pessoais e não comerciais. É proibido:
          </p>
          <ul className="mt-2 list-disc pl-5 space-y-2">
            <li>Tentar burlar restrições geográficas ou de idade do conteúdo original.</li>
            <li>Usar scripts automatizados para coletar dados da plataforma.</li>
            <li>Engajar-se em atividades que sobrecarreguem nossa infraestrutura.</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="mb-3 text-xl font-semibold text-white">4. Propriedade Intelectual</h2>
          <p className="leading-relaxed">
            Todo o conteúdo reproduzido através do player incorporado é de propriedade de seus
            respectivos detentores de direitos autorais no YouTube. O SoundLink respeita as normas
            da plataforma original e não remove anúncios inseridos pelos criadores de conteúdo.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="mb-3 text-xl font-semibold text-white">5. Limitação de Responsabilidade</h2>
          <p className="leading-relaxed">
            O SoundLink não se responsabiliza pela disponibilidade do conteúdo no YouTube ou por
            quaisquer danos resultantes do uso da plataforma. O serviço é fornecido "como está".
          </p>
        </section>

        <section className="mb-8">
          <h2 className="mb-3 text-xl font-semibold text-white">6. Alterações nos Termos</h2>
          <p className="leading-relaxed">
            Reservamo-nos o direito de modificar estes termos a qualquer momento. O uso continuado
            do serviço após as alterações constitui aceitação dos novos termos.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="mb-3 text-xl font-semibold text-white">7. Contato</h2>
          <p className="leading-relaxed">
            Para questões legais ou técnicas, entre em contato através do formulário de feedback no
            perfil do usuário.
          </p>
        </section>
      </div>
    </MainLayout>
  )
}
