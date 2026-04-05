import MainLayout from '@/components/layout/MainLayout'
import Link from 'next/link'

export const metadata = {
  title: 'Política de Privacidade – SoundLink',
}

export default function PrivacyPage() {
  return (
    <MainLayout>
      <div className="mx-auto max-w-3xl px-4 py-10 text-brand-text">
        <h1 className="mb-6 text-3xl font-bold text-white">Política de Privacidade</h1>
        <p className="mb-4 text-sm text-brand-text/60">Última atualização: março de 2026</p>

        <section className="mb-8">
          <h2 className="mb-3 text-xl font-semibold text-white">1. Introdução</h2>
          <p className="leading-relaxed mb-4">
            A sua privacidade é de extrema importância para nós. Esta Política de Privacidade descreve como o SoundLink coletamos, usamos, processamos e protegemos suas informações pessoais ao utilizar nosso serviço. Ao acessar nosso site, você concorda com as práticas descritas neste documento.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="mb-3 text-xl font-semibold text-white">2. Informações que Coletamos</h2>
          <p className="leading-relaxed mb-4">
            Coletamos informações para fornecer serviços melhores a todos os nossos usuários. As informações coletadas incluem:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Informações de Registro:</strong> Quando você cria uma conta, solicitamos seu nome de usuário, endereço de e-mail e uma senha criptografada.</li>
            <li><strong>Dados de Uso:</strong> Coletamos dados sobre como você interage com o serviço, incluindo as músicas que você adiciona, as playlists que cria e seus padrões de navegação.</li>
            <li><strong>Informações do Dispositivo:</strong> Podemos coletar informações específicas do dispositivo (como modelo de hardware, versão do sistema operacional e identificadores exclusivos).</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="mb-3 text-xl font-semibold text-white">3. Google AdSense e Cookies de Terceiros</h2>
          <p className="leading-relaxed mb-4">
            O SoundLink utiliza o Google AdSense para exibir anúncios. Como fornecedor de terceiros, o Google utiliza cookies para exibir anúncios neste site.
          </p>
          <p className="leading-relaxed mb-4">
            O uso do cookie DART pelo Google permite que ele exiba anúncios para você com base em sua visita a este e outros sites na Internet. Além disso, utilizamos outras tecnologias de rastreamento para melhorar a experiência do usuário e analisar o tráfego do site.
          </p>
          <p className="leading-relaxed">
            Você pode optar por não aceitar cookies através das configurações do seu navegador ou visitando as <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer" className="text-brand-primary hover:underline">Configurações de Anúncios do Google</a>.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="mb-3 text-xl font-semibold text-white">4. Como Usamos as Informações</h2>
          <p className="leading-relaxed mb-4">
            Utilizamos as informações coletadas para:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Fornecer, manter e melhorar nossos serviços musicais.</li>
            <li>Processar e gerenciar sua conta pessoal.</li>
            <li>Personalizar sua experiência com recomendações e conteúdos relevantes.</li>
            <li>Comunicar-nos com você sobre atualizações, novidades ou suporte técnico.</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="mb-3 text-xl font-semibold text-white">5. Compartilhamento de Dados</h2>
          <p className="leading-relaxed">
            Não compartilhamos suas informações pessoais com empresas, organizações ou indivíduos externos ao SoundLink, exceto em circunstâncias legais obrigatórias ou com o seu consentimento explícito. Suas playlists marcadas como &quot;Públicas&quot; serão visíveis para outros usuários da plataforma.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="mb-3 text-xl font-semibold text-white">6. Segurança da Informação</h2>
          <p className="leading-relaxed">
            Trabalhamos arduamente para proteger o SoundLink e nossos usuários contra acesso não autorizado ou alteração, divulgação ou destruição não autorizada das informações que detemos. Utilizamos criptografia de ponta (bcrypt) para o armazenamento de senhas e protocolos de segurança robustos.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="mb-3 text-xl font-semibold text-white">7. Seus Direitos (LGPD)</h2>
          <p className="leading-relaxed mb-4">
            Em conformidade com a Lei Geral de Proteção de Dados (LGPD), você tem o direito de:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Acessar seus dados pessoais a qualquer momento.</li>
            <li>Solicitar a correção de dados incompletos ou inexatos.</li>
            <li>Solicitar a eliminação total de seus dados pessoais do nosso sistema.</li>
            <li>Revogar seu consentimento para o processamento de dados.</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="mb-3 text-xl font-semibold text-white">8. Contato</h2>
          <p className="leading-relaxed">
            Se você tiver dúvidas sobre esta Política de Privacidade ou sobre como tratamos seus dados, entre em contato conosco através do e-mail <span className="text-white font-medium">suporte@soundlink.com</span> ou pela nossa página de <Link href="/contato" className="text-brand-primary hover:underline">Contato</Link>.
          </p>
        </section>

      </div>
    </MainLayout>
  )
}
