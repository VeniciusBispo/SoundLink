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

// Returns true if email was sent successfully
export async function sendVerificationEmail(email: string, token: string): Promise<boolean> {
  const rawBase = process.env.NEXTAUTH_URL ?? 'https://soundlink-app.netlify.app'
  const baseUrl = rawBase.replace(/\.(\/|$)/, '$1').replace(/\/$/, '')
  const verifyUrl = `${baseUrl}/api/auth/verify-email?token=${token}`
  const html = buildEmailHtml(verifyUrl)
  const subject = 'Confirme seu e-mail — SoundLink'
  const from = process.env.SMTP_FROM ?? 'SoundLink <onboarding@resend.dev>'

  // Option 1: Resend API (RESEND_API_KEY) — easiest, no SMTP config
  if (process.env.RESEND_API_KEY) {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ from, to: [email], subject, html }),
    })
    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      console.error('[email] Resend error:', res.status, JSON.stringify(body))
      return false
    }
    return true
  }

  // Option 2: SMTP via nodemailer
  if (process.env.SMTP_HOST) {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT ?? '587'),
      secure: process.env.SMTP_PORT === '465',
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    })
    await transporter.sendMail({ from, to: email, subject, html })
    return true
  }

  // No mail service configured
  return false
}

