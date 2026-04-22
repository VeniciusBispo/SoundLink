import MainLayout from '@/components/layout/MainLayout'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { BLOG_POSTS } from '@/lib/blog-data'
import { HiCalendar, HiClock, HiUser, HiChevronLeft } from 'react-icons/hi'
import Footer from '@/components/layout/Footer'
import Script from 'next/script'

interface ArticlePageProps {
  params: { slug: string }
}

export async function generateMetadata({ params }: ArticlePageProps) {
  const post = BLOG_POSTS.find((p) => p.slug === params.slug)
  if (!post) return { title: 'Post não encontrado' }

  return {
    title: `${post.title} | Blog SoundLink`,
    description: post.excerpt,
  }
}

export default function ArticlePage({ params }: ArticlePageProps) {
  const post = BLOG_POSTS.find((p) => p.slug === params.slug)

  if (!post) {
    notFound()
  }

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt,
    author: {
      '@type': 'Organization',
      name: 'SoundLink Team',
    },
    datePublished: post.isoDate,
    image: 'https://soundlink.app/og-image.png',
    publisher: {
      '@type': 'Organization',
      name: 'SoundLink',
      logo: {
        '@type': 'ImageObject',
        url: 'https://soundlink.app/icons/icon.svg'
      }
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://soundlink.app/blog/${post.slug}`
    }
  }

  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://soundlink.app'
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Blog',
        item: 'https://soundlink.app/blog'
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: post.title,
        item: `https://soundlink.app/blog/${post.slug}`
      }
    ]
  }

  return (
    <MainLayout>
      <Script
        id="article-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Script
        id="breadcrumb-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />
      <article className="mx-auto max-w-4xl px-4 py-12">
        <Link 
          href="/blog" 
          className="inline-flex items-center gap-2 mb-10 text-sm font-bold text-brand-text hover:text-white transition-colors"
        >
          <HiChevronLeft className="w-5 h-5 text-brand-primary" /> Voltar ao Blog
        </Link>

        <header className="mb-12">
          <div className="flex items-center gap-4 mb-6 text-xs font-bold uppercase tracking-widest text-brand-primary">
            <span className="px-2 py-1 rounded bg-brand-primary/10">{post.category}</span>
          </div>
          
          <h1 className="mb-8 text-4xl font-extrabold text-white sm:text-5xl leading-tight">
            {post.title}
          </h1>

          <div className="flex flex-wrap items-center gap-6 py-6 border-y border-white/5 text-sm text-brand-text/60">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-brand-primary/20 flex items-center justify-center text-brand-primary">
                <HiUser className="w-4 h-4" />
              </div>
              <span className="font-medium text-white">{post.author}</span>
            </div>
            <div className="flex items-center gap-2">
              <HiCalendar className="w-4 h-4" />
              <time dateTime={post.isoDate}>{post.date}</time>
            </div>
            <div className="flex items-center gap-2">
              <HiClock className="w-4 h-4" />
              {post.readTime} de leitura
            </div>
          </div>
        </header>

        {/* Feature Image Placeholder */}
        <div className="w-full aspect-video mb-12 rounded-3xl bg-gradient-to-br from-brand-card to-brand-primary/10 flex items-center justify-center text-8xl border border-white/5 shadow-2xl">
          {post.category === 'Tutoriais' ? '📖' : post.category === 'Tecnologia' ? '💻' : '🌍'}
        </div>

        <div className="prose prose-invert prose-brand max-w-none">
          <div 
            className="text-lg leading-relaxed text-brand-text space-y-6 blog-content"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        </div>

        <footer className="mt-20 pt-10 border-t border-white/5">
          <div className="rounded-3xl bg-brand-card p-8 md:p-12 border border-white/5 text-center">
            <h3 className="text-2xl font-bold text-white mb-4">Gostou deste artigo?</h3>
            <p className="mb-8 text-brand-text max-w-lg mx-auto">
              Compartilhe com seus amigos e ajude a nossa comunidade de entusiastas musicais a crescer!
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link 
                href="/register"
                className="px-8 py-3 rounded-full bg-brand-primary text-black font-bold hover:scale-105 transition-transform"
              >
                Comece a usar agora
              </Link>
            </div>
          </div>

          <div className="mt-16 flex justify-between items-center">
             <Link href="/blog" className="text-brand-primary font-bold hover:underline">
               ← Ver outros artigos
             </Link>
             <div className="flex gap-4">
               {/* Social links placeholder */}
               <div className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 transition-colors flex items-center justify-center cursor-pointer">
                 𝕏
               </div>
               <div className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 transition-colors flex items-center justify-center cursor-pointer">
                 f
               </div>
             </div>
          </div>
        </footer>
      </article>
      <Footer />
    </MainLayout>
  )
}
