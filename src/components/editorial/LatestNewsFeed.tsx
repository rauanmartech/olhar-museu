import React from "react";
import Link from "next/link";
import { ArrowRight, Clock } from "lucide-react";
import { Post } from "@/types/editorial";
import { NewsCard } from "./NewsCard";

interface LatestNewsFeedProps {
  posts: Post[];
  title?: string;
  subtitle?: string;
  showViewAll?: boolean;
}

export function LatestNewsFeed({
  posts,
  title = "Últimas Notícias",
  subtitle = "Acontecimentos e coberturas recentes do patrimônio cultural",
  showViewAll = true,
}: LatestNewsFeedProps) {
  return (
    <section className="w-full space-y-6" aria-label={title}>
      {/* Cabeçalho da Seção */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 pb-3 border-b-2 border-night">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-gold" />
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-night tracking-tight">
              {title}
            </h2>
          </div>
          {subtitle && (
            <p className="text-xs sm:text-sm text-stone-dark font-sans">
              {subtitle}
            </p>
          )}
        </div>

        {showViewAll && (
          <Link
            href="/noticias"
            className="inline-flex items-center gap-1 font-mono text-xs text-night font-bold hover:text-gold uppercase tracking-wider transition-colors shrink-0 group"
          >
            <span>Ver todo o arquivo</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </Link>
        )}
      </div>

      {/* Grid de Notícias Recentes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.map((post) => (
          <NewsCard key={post.id} post={post} variant="standard" />
        ))}
      </div>
    </section>
  );
}
