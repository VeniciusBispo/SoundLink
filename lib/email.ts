import nodemailer from 'nodemailer'

function buildEmailHtml(verifyUrl: string) {
  return `
    <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; background: #121212; color: #fff; padding: 32px; border-radius: 16px;">
      <h1 style="color: #1DB954; margin-bottom: 8px;">SoundLink</h1>
      <h2 style="font-size: 20px; margin-bottom: 16px;">Confirme seu e-mail</h2>
      <p style="color: #b3b3b3; margin-bottom: 24px;">
        Clique no botão abaixo para validar seu endereço de e-mail e ativar sua conta.
        O link expira em 24 horas.
      </p>
      <a
        href="${verifyUrl}"
        style="display: inline-block; background: #1DB954; color: #000; font-weight: bold; padding: 14px 28px; border-radius: 100px; text-decoration: none;"
      >
        Confirmar e-mail
      </a>
      <p style="color: #535353; font-size: 12px; margin-top: 24px;">
        Se você não criou uma conta no SoundLink, ignore este e-mail.
      </p>
    </div>
  `
}

function buildEmailText(verifyUrl: string): string {
  return `Confirme seu e-mail — SoundLink\n\nClique no link abaixo para validar seu endereço de e-mail e ativar sua conta. O link expira em 24 horas.\n\n${verifyUrl}\n\nSe você não criou uma conta no SoundLink, ignore este e-mail.`
}

// Returns true if email was sent successfully
export async function sendVerificationEmail(email: string, token: string): Promise<boolean> {
  const rawBase = process.env.NEXTAUTH_URL ?? 'https://soundlink-app.netlify.app'
  const baseUrl = rawBase.replace(/\.(\/|$)/, '$1').replace(/\/$/, '')
  const verifyUrl = `${baseUrl}/api/auth/verify-email?token=${token}`
  const html = buildEmailHtml(verifyUrl)
  const text = buildEmailText(verifyUrl)
  const subject = 'Confirme seu e-mail — SoundLink'
  const from = process.env.EMAIL_FROM ?? 'SoundLink <noreply@soundlink.com>'

  // Log para depuração no Netlify
  console.log(`[Email Service] Tentando enviar e-mail para: ${email}`)
  console.log(`[Email Service] Remetente: ${from}`)
  console.log(`[Email Service] SMTP_HOST configurado: ${!!process.env.SMTP_HOST}`)

  try {
    // Option 1: SMTP via nodemailer
    if (process.env.SMTP_HOST) {
      const transportConfig = {
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT ?? '587'),
        secure: process.env.SMTP_PORT === '465',
        auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
      }

      console.log(`[Email Service] Criando transporte com host: ${transportConfig.host}`)
      const transporter = nodemailer.createTransport(transportConfig)

      // Verifica a conexão e autenticação
      await transporter.verify()
      console.log('[Email Service] Transporte verificado com sucesso.')

      console.log('[Email Service] Enviando e-mail...')
      await transporter.sendMail({ from, to: email, subject, html, text })
      console.log('[Email Service] E-mail enviado com sucesso.')
      return true
    }

    // Fallback for development (log to console)
    console.log('⚠️ [Email Service] Fallback: Nenhuma configuração de SMTP encontrada.')
    console.log(`To: ${email}`)
    console.log(`Link: ${verifyUrl}`)
    // In dev, we can consider this a "success" to not block the registration flow
    return true
  } catch (error) {
    console.error('[Email Service] ERRO FATAL ao enviar e-mail de verificação:', error)
    return false
  }
}
