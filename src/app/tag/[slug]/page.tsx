import React from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { EditorialService } from "@/lib/services/editorialService";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { NewsCard } from "@/components/editorial/NewsCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { Tag as TagIcon } from "lucide-react";

interface TagPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({ params }: TagPageProps): Promise<Metadata> {
  const { slug } = await params;
  const tag = await EditorialService.getTagBySlug(slug);

  if (!tag) {
    return {
      title: "Tópico não encontrado",
    };
  }

  return {
    title: `#${tag.name} — Tópico Editorial`,
    description: `Reportagens e publicações relacionadas ao tema ${tag.name} no Olhar Museu.`,
  };
}

export default async function TagPage({ params }: TagPageProps) {
  const { slug } = await params;
  const tag = await EditorialService.getTagBySlug(slug);

  if (!tag) {
    notFound();
  }

  const { posts } = await EditorialService.getFilteredPosts({
    tagSlug: tag.slug,
    limit: 12,
  });

  return (
    <div className="space-y-10">
      {/* Breadcrumbs */}
      <Breadcrumbs
        items={[
          { label: "Notícias", href: "/noticias" },
          { label: `Tópico: #${tag.name}` },
        ]}
      />

      {/* Cabeçalho do Tópico */}
      <header className="space-y-3 pb-6 border-b-2 border-night">
        <div className="flex items-center gap-2 font-mono text-xs font-bold text-gold uppercase tracking-widest">
          <TagIcon className="w-4 h-4" />
          <span>Tópico Temático</span>
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-night tracking-tight">
          #{tag.name}
        </h1>
        <p className="font-sans text-sm sm:text-base text-blue-deep max-w-2xl leading-relaxed">
          Explorando todas as matérias, pesquisas e acontecimentos catalogados sob este assunto.
        </p>
      </header>

      {/* Grid de Notícias */}
      {posts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <NewsCard key={post.id} post={post} variant="standard" />
          ))}
        </div>
      ) : (
        <EmptyState
          title={`Nenhuma notícia com a tag #${tag.name}`}
          description="Ainda não foram publicadas matérias vinculadas a este tópico específico."
          actionHref="/noticias"
          actionLabel="Ver todas as notícias"
        />
      )}
    </div>
  );
}
