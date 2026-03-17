// c:\Users\vinic\Desktop\Musicnews\lib\reset-mail.ts
import nodemailer from 'nodemailer'

interface SendResetResult {
  success: boolean
  error?: unknown
}

export async function sendResetEmail(email: string, token: string): Promise<SendResetResult> {
  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
  // Remove barra final se existir para evitar //
  const cleanBaseUrl = baseUrl.replace(/\/$/, '')
  const resetLink = `${cleanBaseUrl}/reset-password?token=${token}`

  const subject = 'Redefinição de senha - SoundLink'
  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background-color: #121212; color: #fff; padding: 24px; border-radius: 12px;">
      <h2 style="color: #1DB954; margin-top: 0;">Redefinição de Senha</h2>
      <p style="color: #b3b3b3;">Você solicitou a redefinição de senha para sua conta no SoundLink.</p>
      <p style="color: #b3b3b3;">Clique no botão abaixo para criar uma nova senha:</p>
      <a href="${resetLink}" style="display: inline-block; background-color: #1DB954; color: #000; font-weight: bold; padding: 14px 28px; text-decoration: none; border-radius: 50px; margin: 24px 0;">Redefinir Senha</a>
      <p style="color: #b3b3b3; font-size: 14px;">Ou copie e cole este link no seu navegador:</p>
      <p style="color: #b3b3b3; font-size: 12px; word-break: break-all; background: #2a2a2a; padding: 8px; border-radius: 4px;">${resetLink}</p>
      <p style="color: #666; font-size: 12px; margin-top: 32px;">Este link expira em 1 hora. Se você não solicitou, ignore este e-mail.</p>
    </div>
  `
  const text = `Redefinição de senha SoundLink.\n\nAcesse o link a seguir para redefinir sua senha: ${resetLink}\n\nEste link expira em 1 hora.`
  
  const from = process.env.EMAIL_FROM || 'SoundLink <noreply@soundlink.com>'

  // Log para depuração no Netlify
  console.log(`[Reset Mail] Tentando enviar e-mail para: ${email}`)
  console.log(`[Reset Mail] Remetente: ${from}`)
  console.log(`[Reset Mail] SMTP_HOST configurado: ${!!process.env.SMTP_HOST}`)

  try {
    // 1. Tenta usar SMTP (Brevo/Outros) se configurado
    if (process.env.SMTP_HOST) {
      const transportConfig = {
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT) || 587,
        secure: process.env.SMTP_PORT === '465',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      }
      console.log(`[Reset Mail] Criando transporte com host: ${transportConfig.host}`)
      const transporter = nodemailer.createTransport(transportConfig)

      await transporter.verify()
      console.log('[Reset Mail] Transporte verificado com sucesso.')

      console.log('[Reset Mail] Enviando e-mail...')
      await transporter.sendMail({
        from,
        to: email,
        subject,
        html,
        text,
      })
      console.log('[Reset Mail] E-mail enviado com sucesso.')
      return { success: true }
    }

    // 2. Fallback para desenvolvimento (apenas log)
    console.log('⚠️ [Reset Mail] Fallback: Nenhuma configuração de SMTP encontrada.')
    console.log(`To: ${email}`)
    console.log(`Link: ${resetLink}`)
    return { success: true }
  } catch (error) {
    console.error('[Reset Mail] ERRO FATAL ao enviar e-mail de reset:', error)
    return { success: false, error }
  }
}
