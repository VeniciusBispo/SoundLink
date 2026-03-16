import Link from 'next/link'

export default function BottomFooter() {
  return (
    <footer className="w-full bg-black text-white py-5 px-4 border-t border-white/10 text-center opacity-90">
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-2 md:gap-0">
        <div className="flex flex-col md:flex-row items-center gap-2 md:gap-4">
          <span className="font-extrabold text-base tracking-tight">SoundLink</span>
          <span className="text-xs text-spotify-text">© {new Date().getFullYear()} Projeto acadêmico sem fins lucrativos</span>
        </div>
        <div className="flex gap-4 text-xs mt-2 md:mt-0">
          <Link href="/privacy" className="hover:underline text-spotify-text hover:text-white transition">Privacidade</Link>
          <Link href="/offline" className="hover:underline text-spotify-text hover:text-white transition">Offline</Link>
          <a href="https://github.com/" target="_blank" rel="noopener noreferrer" className="hover:underline text-spotify-text hover:text-white transition">GitHub</a>
        </div>
      </div>
    </footer>
  )
}
