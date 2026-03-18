export interface ParsedEmailFrom {
  name: string
  email: string
  formatted: string
}

/**
 * Parses EMAIL_FROM like:
 * - SoundLink <vipgeralfoda@gmail.com>
 * - "SoundLink" <vipgeralfoda@gmail.com>
 * - vipgeralfoda@gmail.com
 */
export function parseEmailFrom(raw: string | undefined, fallbackEmail: string, fallbackName = 'SoundLink'): ParsedEmailFrom {
  const trimmed = (raw ?? '').trim()
  if (!trimmed) {
    const formatted = `${fallbackName} <${fallbackEmail}>`
    return { name: fallbackName, email: fallbackEmail, formatted }
  }

  // Matches: optional quoted/unquoted name + <email>
  const match = trimmed.match(/^(?:"?([^"]+)"?\s*)?<([^>]+)>$/)
  if (match) {
    const name = (match[1]?.trim() || fallbackName).trim()
    const email = match[2].trim()
    const formatted = `${name} <${email}>`
    return { name, email, formatted }
  }

  const email = trimmed
  const formatted = `${fallbackName} <${email}>`
  return { name: fallbackName, email, formatted }
}

