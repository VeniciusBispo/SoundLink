import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="w-full bg-brand-card text-white py-8 px-4 mt-16 border-t border-white/5">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex flex-col items-center md:items-start gap-1">
          <span className="font-black text-2xl tracking-tighter bg-gradient-to-r from-brand-primary to-brand-secondary bg-clip-text text-transparent">SoundLink</span>
          <span className="text-[10px] uppercase font-bold tracking-widest text-brand-text">A música em suas mãos</span>
        </div>
        <div className="flex flex-wrap justify-center gap-x-8 gap-y-3 text-sm font-medium">
          <Link href="/sobre" className="hover:text-brand-primary transition-colors text-brand-text">Sobre nós</Link>
          <Link href="/como-funciona" className="hover:text-brand-primary transition-colors text-brand-text">Como funciona</Link>
          <Link href="/feedback" className="hover:text-brand-secondary transition-colors text-brand-text">Feedback</Link>
          <Link href="/privacy" className="hover:text-brand-text/80 transition-colors text-brand-text">Privacidade</Link>
          <Link href="/terms" className="hover:text-brand-text/80 transition-colors text-brand-text">Termos</Link>
        </div>
        <div className="text-[10px] text-brand-text/40 font-medium">
          © {new Date().getFullYear()} SoundLink. Todos os direitos reservados.
        </div>
      </div>
    </footer>
  )
}
