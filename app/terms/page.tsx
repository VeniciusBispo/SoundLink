import MainLayout from '@/components/layout/MainLayout'
import Link from 'next/link'

export const metadata = {
  title: 'Termos de Uso – SoundLink',
  description: 'Leia os Termos de Uso do SoundLink para entender seus direitos e responsabilidades ao utilizar nossa plataforma de música.',
}

export default function TermsPage() {
  return (
    <MainLayout>
      <div className="mx-auto max-w-3xl px-4 py-10 text-brand-text">
        <h1 className="mb-6 text-3xl font-bold text-white">Termos de Uso</h1>
        <p className="mb-4 text-sm text-brand-text/60">Última atualização: abril de 2026</p>

        <section className="mb-8">
          <h2 className="mb-3 text-xl font-semibold text-white">1. Aceitação dos Termos</h2>
          <p className="leading-relaxed">
            Ao acessar e utilizar a plataforma SoundLink, você concorda plenamente com estes Termos de Uso. Este documento constitui um acordo legal entre você (o Usuário) e o SoundLink. Se você não concordar com qualquer parte destes termos, solicitamos que interrompa o uso do serviço imediatamente.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="mb-3 text-xl font-semibold text-white">2. Elegibilidade e Cadastro</h2>
          <p className="leading-relaxed mb-4">
            Para utilizar certos recursos da plataforma, você deve criar uma conta fornecendo informações precisas e completas. Você é o único responsável por manter a confidencialidade de sua senha e por todas as atividades que ocorrem em sua conta.
          </p>
          <p className="leading-relaxed">
            O uso do SoundLink é destinado a indivíduos com 13 anos de idade ou mais. Usuários menores de idade devem ter o consentimento de seus pais ou responsáveis.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="mb-3 text-xl font-semibold text-white">3. Descrição do Serviço e YouTube API</h2>
          <p className="leading-relaxed mb-4">
            O SoundLink é uma interface de gerenciamento de listas de reprodução que utiliza os **Serviços de API do YouTube**. Ao usar o SoundLink, os usuários também estão vinculados aos <a href="https://www.youtube.com/t/terms" target="_blank" rel="noopener noreferrer" className="text-brand-primary hover:underline">Termos de Serviço do YouTube</a>.
          </p>
          <p className="leading-relaxed">
            Não hospedamos, enviamos ou transmitimos nenhum conteúdo de áudio ou vídeo em nossos próprios servidores. Todo o conteúdo é servido diretamente pelos servidores do YouTube através do player oficial incorporado.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="mb-3 text-xl font-semibold text-white">4. Propriedade Intelectual</h2>
          <p className="leading-relaxed mb-4">
            O software, design, logotipos e textos originais do SoundLink são de nossa propriedade exclusiva. Os direitos autorais dos vídeos e músicas reproduzidos pertencem aos seus respectivos proprietários no YouTube e seus licenciadores.
          </p>
          <p className="leading-relaxed text-sm italic">
            Respeitamos as leis de direitos autorais (DMCA) e não removemos anúncios inseridos pelos detentores de direitos no YouTube.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="mb-3 text-xl font-semibold text-white">5. Conduta do Usuário</h2>
          <p className="leading-relaxed mb-4">Você concorda em não utilizar o SoundLink para:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Violar qualquer lei local, estadual, nacional ou internacional.</li>
            <li>Modificar, adaptar ou hackear o serviço de qualquer forma.</li>
            <li>Extrair conteúdo do YouTube para download ilegal de áudio ou vídeo.</li>
            <li>Criar playlists com nomes ofensivos, abusivos ou ilegais.</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="mb-3 text-xl font-semibold text-white">6. Isenção de Garantias</h2>
          <p className="leading-relaxed">
            O SoundLink é fornecido &quot;como está&quot; e &quot;conforme disponível&quot;. Não garantimos que o serviço será ininterrupto, livre de erros ou que o conteúdo específico do YouTube estará sempre disponível para reprodução em sua região.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="mb-3 text-xl font-semibold text-white">7. Limitação de Responsabilidade</h2>
          <p className="leading-relaxed">
            Em nenhuma circunstância o SoundLink será responsável por quaisquer danos diretos, indiretos, incidentais ou punitivos decorrentes do seu uso ou incapacidade de usar a plataforma.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="mb-3 text-xl font-semibold text-white">8. Suporte e Questões Legais</h2>
          <p className="leading-relaxed">
            Para suporte, dúvidas sobre estes termos ou questões legais, entre em contato através da nossa <Link href="/contato" className="text-brand-primary hover:underline">Página de Contato</Link> ou diretamente pelo e-mail <span className="text-white">legal@soundlink.com</span>.
          </p>
        </section>
      </div>
    </MainLayout>
  )
}

