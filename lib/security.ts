/**
 * 🛡️ SoundLink Security Core
 * Centralized security utilities for input sanitization and protection.
 */

export function sanitize(str: string): string {
  if (!str) return ''
  // Basic but robust escape to prevent common XSS
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

export function validateId(id: string): boolean {
  // MongoDB ObjectId regex
  return /^[0-9a-fA-F]{24}$/.test(id)
}

/**
 * Prevents SSRF by checking if a URL is within allowed domains
 */
export function isSafeUrl(url: string): boolean {
  try {
    const parsed = new URL(url)
    const allowedDomains = ['youtube.com', 'i.ytimg.com', 'googlesyndication.com']
    return allowedDomains.some(domain => parsed.hostname.endsWith(domain))
  } catch {
    return false
  }
}
