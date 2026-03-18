// c:\Users\vinic\Desktop\Musicnews\lib\reset-mail.ts

import { parseEmailFrom } from '@/lib/email-from'

interface SendResetResult {
  success: boolean
  error?: unknown
}

export async function sendResetEmail(email: string, token: string): Promise<SendResetResult> {
  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
  const cleanBaseUrl = baseUrl.replace(/\/$/, '')
  const resetLink = `${cleanBaseUrl}/reset-password?token=${token}`

  // Aceita tanto BREVO_API_KEY quanto SMTP_PASS (compatibilidade)
  const apiKey = process.env.BREVO_API_KEY || process.env.SMTP_PASS

  console.log(`[Reset Mail] Tentando enviar e-mail para: ${email}`)
  console.log(`[Reset Mail] API Key configurada: ${!!apiKey}`)

  // Fallback para desenvolvimento (apenas log)
  if (!apiKey) {
    console.log('⚠️ [Reset Mail] Nenhuma API key configurada. Usando fallback de log.')
    console.log(`To: ${email}`)
    console.log(`Link: ${resetLink}`)
    return { success: true }
  }

  const sender = parseEmailFrom(process.env.EMAIL_FROM, 'a50286001@smtp-brevo.com', 'SoundLink')

  console.log(`[Reset Mail] Remetente: ${sender.formatted}`)

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
        subject: 'Redefinição de senha - SoundLink',
        htmlContent: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background-color: #121212; color: #fff; padding: 24px; border-radius: 12px;">
            <h2 style="color: #1DB954; margin-top: 0;">Redefinição de Senha</h2>
            <p style="color: #b3b3b3;">Você solicitou a redefinição de senha para sua conta no SoundLink.</p>
            <p style="color: #b3b3b3;">Clique no botão abaixo para criar uma nova senha:</p>
            <a href="${resetLink}" style="display: inline-block; background-color: #1DB954; color: #000; font-weight: bold; padding: 14px 28px; text-decoration: none; border-radius: 50px; margin: 24px 0;">Redefinir Senha</a>
            <p style="color: #b3b3b3; font-size: 14px;">Ou copie e cole este link no seu navegador:</p>
            <p style="color: #b3b3b3; font-size: 12px; word-break: break-all; background: #2a2a2a; padding: 8px; border-radius: 4px;">${resetLink}</p>
            <p style="color: #666; font-size: 12px; margin-top: 32px;">Este link expira em 1 hora. Se você não solicitou, ignore este e-mail.</p>
          </div>
        `,
        textContent: `Redefinição de senha SoundLink.\n\nAcesse o link a seguir para redefinir sua senha: ${resetLink}\n\nEste link expira em 1 hora.`,
      }),
    })

    const data = await res.json()

    if (!res.ok) {
      console.error('[Reset Mail] Erro na API do Brevo:', data)
      return { success: false, error: data }
    }

    console.log('[Reset Mail] E-mail enviado com sucesso via API Brevo:', data.messageId)
    return { success: true }
  } catch (error) {
    console.error('[Reset Mail] ERRO FATAL ao enviar e-mail:', error)
    return { success: false, error }
  }
}
