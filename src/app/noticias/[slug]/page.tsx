import React from "react";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { Clock, Landmark, Tag as TagIcon, ArrowLeft } from "lucide-react";
import { EditorialService } from "@/lib/services/editorialService";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Badge } from "@/components/ui/Badge";
import { ArticleContent } from "@/components/editorial/ArticleContent";
import { AuthorBio } from "@/components/editorial/AuthorBio";
import { NewsCard } from "@/components/editorial/NewsCard";
import { formatDate } from "@/lib/utils";

interface ArticlePageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await EditorialService.getPostBySlug(slug);

  if (!post) {
    return {
      title: "Notícia não encontrada",
    };
  }

  const title = post.seo_title || `${post.title} | Olhar Museu`;
  const description = post.seo_description || post.excerpt;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "article",
      publishedTime: post.published_at,
      authors: [post.author.name],
      images: [
        {
          url: post.featured_image.url,
          width: post.featured_image.width || 1200,
          height: post.featured_image.height || 630,
          alt: post.featured_image.alt_text || post.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [post.featured_image.url],
    },
  };
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params;
  const post = await EditorialService.getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const relatedPosts = await EditorialService.getRelatedPosts(post, 3);

  // Schema estruturado NewsArticle para SEO
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: post.title,
    description: post.excerpt,
    image: [post.featured_image.url],
    datePublished: post.published_at,
    dateModified: post.updated_at,
    author: [
      {
        "@type": "Person",
        name: post.author.name,
      },
    ],
    publisher: {
      "@type": "Organization",
      name: "Olhar Museu por SiMOP",
      logo: {
        "@type": "ImageObject",
        url: "https://olharmuseu.com.br/images/logo-simop.webp",
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `https://olharmuseu.com.br/noticias/${post.slug}`,
    },
  };

  return (
    <article className="space-y-10 max-w-5xl mx-auto">
      {/* Script JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Breadcrumbs */}
      <div className="flex items-center justify-between">
        <Breadcrumbs
          items={[
            { label: "Notícias", href: "/noticias" },
            { label: post.category.name, href: `/categoria/${post.category.slug}` },
            { label: post.title },
          ]}
        />
        <Link
          href="/noticias"
          className="hidden sm:inline-flex items-center gap-1 font-mono text-xs text-stone-dark hover:text-gold transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Voltar ao arquivo</span>
        </Link>
      </div>

      {/* Cabeçalho da Notícia */}
      <header className="space-y-6 max-w-4xl mx-auto text-center sm:text-left">
        {/* Editoria e Museu */}
        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3">
          <Link href={`/categoria/${post.category.slug}`}>
            <Badge variant="gold" size="md">
              {post.category.name}
            </Badge>
          </Link>
          {post.museum && (
            <Link
              href={`/museus/${post.museum.slug}`}
              className="inline-flex items-center gap-1.5 text-xs font-mono text-stone-dark hover:text-gold transition-colors bg-white px-3 py-1 border border-stone"
            >
              <Landmark className="w-3.5 h-3.5 text-gold" />
              <span className="font-semibold">{post.museum.name}</span>
            </Link>
          )}
        </div>

        {/* Manchete Principal */}
        <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-night leading-[1.12] tracking-tight">
          {post.title}
        </h1>

        {/* Subtítulo / Linha Fina */}
        {post.subtitle && (
          <p className="font-sans text-base sm:text-xl text-blue-deep font-normal leading-relaxed">
            {post.subtitle}
          </p>
        )}

        {/* Metadados do Autor e Publicação */}
        <div className="pt-4 border-t border-stone flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-xs text-stone-dark">
          <div className="flex items-center gap-3">
            {post.author.avatar_url && (
              <div className="relative w-9 h-9 rounded-full overflow-hidden border border-gold shrink-0 bg-stone/40">
                <Image
                  src={post.author.avatar_url}
                  alt={post.author.name}
                  fill
                  sizes="36px"
                  className="object-cover"
                />
              </div>
            )}
            <div>
              <span className="text-night font-bold block">{post.author.name}</span>
              <span className="text-[10px] text-stone-dark">Redação Olhar Museu</span>
            </div>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <time dateTime={post.published_at}>{formatDate(post.published_at)}</time>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-gold" />
              {post.reading_time_minutes} min de leitura
            </span>
          </div>
        </div>
      </header>

      {/* Imagem de Destaque / Hero com legenda e crédito */}
      <figure className="space-y-2 border border-stone bg-white p-2 sm:p-3">
        <div className="relative aspect-[16/9] w-full overflow-hidden bg-ivory">
          <Image
            src={post.featured_image.url}
            alt={post.featured_image.alt_text || post.title}
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 1024px"
            className="object-cover"
          />
        </div>
        {post.featured_image.caption && (
          <figcaption className="font-mono text-xs text-stone-dark px-2 pt-1 pb-0.5 leading-relaxed flex flex-col sm:flex-row sm:items-center justify-between gap-1">
            <span>{post.featured_image.caption}</span>
            <span className="text-[10px] text-stone-dark/70 uppercase">Acervo Editorial</span>
          </figcaption>
        )}
      </figure>

      {/* Corpo Editorial do Artigo */}
      <div className="pt-4">
        <ArticleContent content={post.content} />
      </div>

      {/* Tags / Tópicos Relacionados */}
      {post.tags.length > 0 && (
        <div className="max-w-[68ch] mx-auto pt-6 border-t border-stone space-y-3">
          <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-stone-dark uppercase tracking-wider">
            <TagIcon className="w-3.5 h-3.5 text-gold" />
            <span>Tópicos Relacionados:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <Link key={tag.id} href={`/tag/${tag.slug}`}>
                <Badge variant="outline" size="sm">
                  #{tag.name}
                </Badge>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Perfil do Autor */}
      <div className="max-w-[68ch] mx-auto">
        <AuthorBio author={post.author} />
      </div>

      {/* Matérias Relacionadas */}
      {relatedPosts.length > 0 && (
        <section className="pt-12 border-t-2 border-night space-y-6" aria-label="Matérias Relacionadas">
          <div className="flex items-center justify-between">
            <h3 className="font-serif text-2xl font-bold text-night">
              Leia Também
            </h3>
            <Link
              href={`/categoria/${post.category.slug}`}
              className="font-mono text-xs text-gold hover:underline uppercase tracking-wider font-bold"
            >
              Mais em {post.category.name} →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {relatedPosts.map((relPost) => (
              <NewsCard key={relPost.id} post={relPost} variant="standard" />
            ))}
          </div>
        </section>
      )}
    </article>
  );
}
