import MainLayout from '@/components/layout/MainLayout'

export const metadata = {
  title: 'Política de Privacidade – SoundLink',
}

export default function PrivacyPage() {
  return (
    <MainLayout>
      <div className="mx-auto max-w-3xl px-4 py-10 text-spotify-text">
        <h1 className="mb-6 text-3xl font-bold text-white">Política de Privacidade</h1>
        <p className="mb-4 text-sm text-spotify-text/60">Última atualização: março de 2026</p>

        <section className="mb-8">
          <h2 className="mb-3 text-xl font-semibold text-white">1. Informações coletadas</h2>
          <p className="leading-relaxed">
            O SoundLink coleta informações fornecidas diretamente por você ao criar uma conta (nome
            de usuário e e-mail) e informações geradas pelo uso do serviço (playlists criadas,
            músicas adicionadas e histórico de acesso).
          </p>
        </section>

        <section className="mb-8">
          <h2 className="mb-3 text-xl font-semibold text-white">2. Cookies e publicidade</h2>
          <p className="leading-relaxed">
            Este site utiliza o Google AdSense para exibir anúncios. O Google pode usar cookies para
            exibir anúncios baseados em visitas anteriores a este e outros sites. Você pode desativar
            o uso de cookies pelo Google acessando as{' '}
            <a
              href="https://www.google.com/settings/ads"
              target="_blank"
              rel="noopener noreferrer"
              className="text-spotify-green hover:underline"
            >
              Configurações de anúncios do Google
            </a>
            .
          </p>
          <p className="mt-3 leading-relaxed">
            Para mais informações sobre como o Google usa os dados, acesse:{' '}
            <a
              href="https://policies.google.com/technologies/partner-sites"
              target="_blank"
              rel="noopener noreferrer"
              className="text-spotify-green hover:underline"
            >
              Como o Google usa informações de sites que usam nossos serviços
            </a>
            .
          </p>
        </section>

        <section className="mb-8">
          <h2 className="mb-3 text-xl font-semibold text-white">3. Uso das informações</h2>
          <p className="leading-relaxed">
            As informações coletadas são usadas exclusivamente para fornecer e melhorar o serviço
            SoundLink. Não vendemos nem compartilhamos seus dados pessoais com terceiros, exceto
            conforme descrito nesta política.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="mb-3 text-xl font-semibold text-white">4. Segurança</h2>
          <p className="leading-relaxed">
            Suas senhas são armazenadas de forma criptografada (bcrypt). O acesso à conta é
            protegido por autenticação e verificação de e-mail.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="mb-3 text-xl font-semibold text-white">5. Seus direitos</h2>
          <p className="leading-relaxed">
            Você pode solicitar a exclusão da sua conta e dados a qualquer momento através da página
            de perfil ou enviando um feedback pelo aplicativo.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="mb-3 text-xl font-semibold text-white">6. Contato</h2>
          <p className="leading-relaxed">
            Dúvidas sobre esta política podem ser enviadas através do formulário de feedback
            disponível no aplicativo.
          </p>
        </section>
      </div>
    </MainLayout>
  )
}
