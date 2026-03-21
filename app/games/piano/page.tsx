import type { Metadata } from 'next'
import MainLayout from '@/components/layout/MainLayout'
import PianoGame from '@/components/games/piano/PianoGame'

export const metadata: Metadata = {
  title: 'Piano Virtual | SoundLink',
  description: 'Toque um piano virtual e divirta-se criando melodias.',
}

export default function PianoPage() {
  return (
    <MainLayout>
      <div className="py-6 h-full flex flex-col">
        <h1 className="text-3xl font-extrabold text-white mb-2">Piano Virtual 🎹</h1>
        <p className="text-spotify-text mb-8">Toque, aprenda e siga as notas da música.</p>
        <PianoGame />
      </div>
    </MainLayout>
  )
}
