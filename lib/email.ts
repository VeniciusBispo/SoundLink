// c:\Users\vinic\Desktop\Musicnews\lib\email.ts

import { parseEmailFrom } from '@/lib/email-from'

function buildEmailHtml(verifyUrl: string) {
  return `
    <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; background: #121212; color: #fff; padding: 32px; border-radius: 16px;">
      <h1 style="color: #EF4444; margin-bottom: 8px;">SoundLink</h1>
      <h2 style="font-size: 20px; margin-bottom: 16px;">Confirme seu e-mail</h2>
      <p style="color: #b3b3b3; margin-bottom: 24px;">
        Clique no botão abaixo para validar seu endereço de e-mail e ativar sua conta.
        O link expira em 24 horas.
      </p>
      <a
        href="${verifyUrl}"
        style="display: inline-block; background: #EF4444; color: #000; font-weight: bold; padding: 14px 28px; border-radius: 100px; text-decoration: none;"
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

  // Aceita tanto BREVO_API_KEY quanto SMTP_PASS (compatibilidade)
  const apiKey = process.env.BREVO_API_KEY || process.env.SMTP_PASS

  const sender = parseEmailFrom(process.env.EMAIL_FROM, 'a50286001@smtp-brevo.com', 'SoundLink')

  console.log(`[Email Service] Tentando enviar e-mail para: ${email}`)
  console.log(`[Email Service] API Key configurada: ${!!apiKey}`)
  console.log(`[Email Service] Remetente: ${sender.formatted}`)

  // Fallback para desenvolvimento (apenas log)
  if (!apiKey) {
    console.log('⚠️ [Email Service] Nenhuma API key configurada. Usando fallback de log.')
    console.log(`To: ${email}`)
    console.log(`Link: ${verifyUrl}`)
    return true
  }

  try {
    const res = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'api-key': apiKey,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        sender: {
          name: sender.name,
          email: sender.email,
        },
        to: [{ email }],
        subject,
        htmlContent: html,
        textContent: text,
      }),
    })

    const data = await res.json()

    if (!res.ok) {
      console.error('[Email Service] Erro na API do Brevo:', data)
      return false
    }

    console.log('[Email Service] E-mail enviado com sucesso via API Brevo:', data.messageId)
    return true
  } catch (error) {
    console.error('[Email Service] ERRO FATAL ao enviar e-mail de verificação:', error)
    return false
  }
}
