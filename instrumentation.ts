// This file runs once on server startup before any route handlers.
// It sanitizes environment variables that may have been set with a trailing dot
// by Netlify's DNS (e.g. NEXTAUTH_URL="https://soundlink-app.netlify.app.").
export async function register() {
  if (process.env.NEXTAUTH_URL) {
    process.env.NEXTAUTH_URL = process.env.NEXTAUTH_URL.replace(/\.(?=\/|$)/, '')
  }
}
