import MainLayout from '@/components/layout/MainLayout'
import Link from 'next/link'
import { BLOG_POSTS } from '@/lib/blog-data'
import { HiCalendar, HiClock, HiUser, HiArrowNarrowRight } from 'react-icons/hi'

export const metadata = {
  title: 'Blog SoundLink – Novidades, Tutoriais e Tecnologia Musical',
  description: 'Fique por dentro das últimas novidades do SoundLink, dicas de organização musical e as tendências do mundo do streaming.',
}

export default function BlogPage() {
  return (
    <MainLayout>
      <div className="mx-auto max-w-5xl px-4 py-12">
        <header className="mb-16 text-center">
          <h1 className="mb-4 text-4xl font-extrabold text-white sm:text-5xl">Blog SoundLink</h1>
          <p className="mx-auto max-w-2xl text-lg text-brand-text/80">
            Explorações sobre o universo da música digital, tutoriais exclusivos e os bastidores da nossa tecnologia.
          </p>
        </header>

        <div className="grid gap-10">
          {BLOG_POSTS.map((post) => (
            <article 
              key={post.slug}
              className="group relative overflow-hidden rounded-3xl bg-brand-card border border-white/5 transition-all hover:border-white/20 hover:shadow-2xl hover:shadow-brand-primary/5"
            >
              <div className="flex flex-col md:flex-row h-full">
                {/* Visual Placeholder for Article Image */}
                <div className="w-full md:w-1/3 bg-gradient-to-br from-brand-primary/20 to-brand-secondary/20 flex items-center justify-center p-8 border-b md:border-b-0 md:border-r border-white/5">
                  <div className="text-6xl group-hover:scale-110 transition-transform duration-500">
                    {post.category === 'Tutoriais' ? '📖' : post.category === 'Tecnologia' ? '💻' : '🌍'}
                  </div>
                </div>

                <div className="flex-1 p-8 md:p-10 flex flex-col">
                  <div className="flex flex-wrap items-center gap-4 mb-4 text-xs font-bold uppercase tracking-widest text-brand-primary">
                    <span className="px-2 py-1 rounded bg-brand-primary/10">{post.category}</span>
                    <div className="flex items-center gap-1.5 text-brand-text/60">
                      <HiCalendar className="w-4 h-4" />
                      {post.date}
                    </div>
                  </div>

                  <h2 className="mb-4 text-2xl font-bold text-white group-hover:text-brand-primary transition-colors">
                    <Link href={`/blog/${post.slug}`}>
                      {post.title}
                    </Link>
                  </h2>

                  <p className="mb-8 text-brand-text leading-relaxed line-clamp-3">
                    {post.excerpt}
                  </p>

                  <div className="mt-auto flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1.5 text-sm text-brand-text/60">
                        <HiClock className="w-4 h-4" />
                        {post.readTime} leitura
                      </div>
                    </div>
                    
                    <Link 
                      href={`/blog/${post.slug}`}
                      className="inline-flex items-center gap-2 text-sm font-bold text-white group-hover:translate-x-1 transition-transform"
                    >
                      Ler artigo <HiArrowNarrowRight className="w-4 h-4 text-brand-primary" />
                    </Link>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>

        <section className="mt-24 rounded-3xl bg-gradient-to-br from-brand-primary/10 to-brand-secondary/10 p-12 text-center border border-white/5">
          <h2 className="text-3xl font-bold text-white mb-4">Quer saber mais?</h2>
          <p className="mb-8 text-brand-text max-w-xl mx-auto">
            Siga-nos nas redes sociais e não perca nenhuma atualização sobre novos recursos, parcerias e playlists em destaque.
          </p>
          <div className="flex justify-center gap-4">
            <Link href="/contato" className="px-8 py-3 rounded-full bg-white text-black font-bold hover:scale-105 transition-transform">
              Fale Conosco
            </Link>
          </div>
        </section>
      </div>
    </MainLayout>
  )
}
