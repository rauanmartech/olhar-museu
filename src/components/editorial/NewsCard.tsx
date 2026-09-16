import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Clock, Landmark } from "lucide-react";
import { Post } from "@/types/editorial";
import { Badge } from "@/components/ui/Badge";
import { formatShortDate, cn } from "@/lib/utils";

interface NewsCardProps {
  post: Post;
  variant?: "lead" | "standard" | "horizontal" | "compact" | "minimal";
  className?: string;
  showImage?: boolean;
}

export function NewsCard({
  post,
  variant = "standard",
  className,
  showImage = true,
}: NewsCardProps) {
  // 1. Variante LEAD (Super destaque)
  if (variant === "lead") {
    return (
      <article className={cn("group flex flex-col bg-white border border-stone", className)}>
        {showImage && (
          <Link href={`/noticias/${post.slug}`} className="relative aspect-[16/9] w-full overflow-hidden bg-ivory block">
            <Image
              src={post.featured_image.url}
              alt={post.featured_image.alt_text || post.title}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 66vw"
              className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
            />
          </Link>
        )}
        <div className="p-6 sm:p-8 space-y-3 flex-1 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <Link href={`/categoria/${post.category.slug}`}>
                <Badge variant="gold">{post.category.name}</Badge>
              </Link>
              {post.museum && (
                <Link href={`/museus/${post.museum.slug}`} className="inline-flex items-center gap-1 text-[11px] font-mono text-stone-dark hover:text-gold transition-colors">
                  <Landmark className="w-3 h-3 text-gold" />
                  <span>{post.museum.name}</span>
                </Link>
              )}
            </div>

            <Link href={`/noticias/${post.slug}`} className="block">
              <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-night group-hover:text-gold transition-colors leading-[1.15]">
                {post.title}
              </h2>
            </Link>

            {post.subtitle && (
              <p className="text-sm sm:text-base text-blue-deep font-sans leading-relaxed line-clamp-2">
                {post.subtitle}
              </p>
            )}
          </div>

          <div className="pt-4 border-t border-stone/50 flex items-center justify-between font-mono text-[11px] text-stone-dark">
            <span>Por <strong className="text-night">{post.author.name}</strong></span>
            <div className="flex items-center gap-3">
              <time dateTime={post.published_at}>{formatShortDate(post.published_at)}</time>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3 text-stone-dark" />
                {post.reading_time_minutes} min
              </span>
            </div>
          </div>
        </div>
      </article>
    );
  }

  // 2. Variante HORIZONTAL (Card horizontal com imagem ao lado)
  if (variant === "horizontal") {
    return (
      <article className={cn("group flex flex-col sm:flex-row bg-white border border-stone", className)}>
        {showImage && (
          <Link href={`/noticias/${post.slug}`} className="relative aspect-[16/10] sm:w-2/5 sm:aspect-auto overflow-hidden bg-ivory block shrink-0">
            <Image
              src={post.featured_image.url}
              alt={post.featured_image.alt_text || post.title}
              fill
              sizes="(max-width: 640px) 100vw, 30vw"
              className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
            />
          </Link>
        )}
        <div className="p-5 sm:p-6 space-y-3 flex-1 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <Link href={`/categoria/${post.category.slug}`}>
                <Badge variant="stone" size="sm">{post.category.name}</Badge>
              </Link>
              {post.museum && (
                <span className="text-[10px] font-mono text-stone-dark truncate max-w-[150px]">
                  {post.museum.name}
                </span>
              )}
            </div>

            <Link href={`/noticias/${post.slug}`} className="block">
              <h3 className="font-serif text-lg sm:text-xl font-bold text-night group-hover:text-gold transition-colors leading-snug">
                {post.title}
              </h3>
            </Link>

            <p className="text-xs sm:text-sm text-blue-deep line-clamp-2 font-sans leading-relaxed">
              {post.excerpt}
            </p>
          </div>

          <div className="pt-3 border-t border-stone/40 flex items-center justify-between font-mono text-[11px] text-stone-dark">
            <time dateTime={post.published_at}>{formatShortDate(post.published_at)}</time>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {post.reading_time_minutes} min
            </span>
          </div>
        </div>
      </article>
    );
  }

  // 3. Variante COMPACT (Para laterais, listas secundárias de destaque)
  if (variant === "compact") {
    return (
      <article className={cn("group flex gap-4 py-4 border-b border-stone/60 first:pt-0 last:border-b-0", className)}>
        {showImage && (
          <Link href={`/noticias/${post.slug}`} className="relative w-24 h-20 sm:w-28 sm:h-24 overflow-hidden bg-ivory shrink-0 border border-stone block">
            <Image
              src={post.featured_image.url}
              alt={post.featured_image.alt_text || post.title}
              fill
              sizes="112px"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </Link>
        )}
        <div className="space-y-1.5 flex-1 flex flex-col justify-between">
          <div className="space-y-1">
            <Link href={`/categoria/${post.category.slug}`} className="text-[10px] font-mono text-gold uppercase tracking-wider font-bold block">
              {post.category.name}
            </Link>
            <Link href={`/noticias/${post.slug}`} className="block">
              <h4 className="font-sans text-sm sm:text-base font-bold text-night group-hover:text-gold transition-colors leading-snug line-clamp-2">
                {post.title}
              </h4>
            </Link>
          </div>
          <div className="flex items-center gap-2 font-mono text-[10px] text-stone-dark">
            <time dateTime={post.published_at}>{formatShortDate(post.published_at)}</time>
            <span>•</span>
            <span>{post.reading_time_minutes} min de leitura</span>
          </div>
        </div>
      </article>
    );
  }

  // 4. Variante MINIMAL (Apenas texto com número de posição ou linha fina)
  if (variant === "minimal") {
    return (
      <article className={cn("group py-3 border-b border-stone/50 last:border-b-0 space-y-1.5", className)}>
        <div className="flex items-center gap-2">
          <Link href={`/categoria/${post.category.slug}`} className="text-[10px] font-mono text-gold font-semibold uppercase tracking-wider">
            {post.category.name}
          </Link>
          <span className="text-stone text-[10px]">•</span>
          <time dateTime={post.published_at} className="text-[10px] font-mono text-stone-dark">
            {formatShortDate(post.published_at)}
          </time>
        </div>
        <Link href={`/noticias/${post.slug}`} className="block">
          <h4 className="font-sans text-sm font-bold text-night group-hover:text-gold transition-colors leading-snug line-clamp-2">
            {post.title}
          </h4>
        </Link>
      </article>
    );
  }

  // 5. Variante STANDARD (Padrão de Grid: imagem em cima, texto em baixo)
  return (
    <article className={cn("group flex flex-col bg-white border border-stone justify-between", className)}>
      <div>
        {showImage && (
          <Link href={`/noticias/${post.slug}`} className="relative aspect-[16/10] w-full overflow-hidden bg-ivory block">
            <Image
              src={post.featured_image.url}
              alt={post.featured_image.alt_text || post.title}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            />
          </Link>
        )}
        <div className="p-5 sm:p-6 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <Link href={`/categoria/${post.category.slug}`}>
              <Badge variant="stone" size="sm">{post.category.name}</Badge>
            </Link>
            {post.museum && (
              <Link href={`/museus/${post.museum.slug}`} className="text-[10px] font-mono text-stone-dark hover:text-gold truncate max-w-[140px]">
                {post.museum.name}
              </Link>
            )}
          </div>

          <Link href={`/noticias/${post.slug}`} className="block">
            <h3 className="font-serif text-lg sm:text-xl font-bold text-night group-hover:text-gold transition-colors leading-snug">
              {post.title}
            </h3>
          </Link>

          <p className="text-xs sm:text-sm text-blue-deep line-clamp-3 font-sans leading-relaxed">
            {post.excerpt}
          </p>
        </div>
      </div>

      <div className="px-5 sm:px-6 pb-5 pt-3 border-t border-stone/40 flex items-center justify-between font-mono text-[11px] text-stone-dark">
        <time dateTime={post.published_at}>{formatShortDate(post.published_at)}</time>
        <span className="flex items-center gap-1">
          <Clock className="w-3 h-3 text-stone-dark" />
          {post.reading_time_minutes} min
        </span>
      </div>
    </article>
  );
}
