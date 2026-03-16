import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="w-full bg-spotify-card text-white py-6 px-4 mt-12 border-t border-white/10">
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="font-extrabold text-lg tracking-tight">SoundLink</span>
          <span className="text-xs text-spotify-text">© {new Date().getFullYear()} Todos os direitos reservados</span>
        </div>
        <div className="flex gap-4 text-sm">
          <Link href="/privacy" className="hover:underline text-spotify-text hover:text-white transition">Privacidade</Link>
          <Link href="/offline" className="hover:underline text-spotify-text hover:text-white transition">Offline</Link>
          <a href="https://github.com/" target="_blank" rel="noopener noreferrer" className="hover:underline text-spotify-text hover:text-white transition">GitHub</a>
        </div>
      </div>
    </footer>
  )
}
