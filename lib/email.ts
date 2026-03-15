import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT ?? '587'),
  secure: process.env.SMTP_PORT === '465',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

export async function sendVerificationEmail(email: string, token: string) {
  const baseUrl = process.env.NEXTAUTH_URL ?? 'https://soundlink-app.netlify.app'
  const verifyUrl = `${baseUrl}/api/auth/verify-email?token=${token}`

  await transporter.sendMail({
    from: process.env.SMTP_FROM ?? 'SoundLink <noreply@soundlink.app>',
    to: email,
    subject: 'Confirme seu e-mail — SoundLink',
    html: `
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
    `,
  })
}
