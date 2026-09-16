import React from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { EditorialService } from "@/lib/services/editorialService";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { NewsCard } from "@/components/editorial/NewsCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { Sparkles } from "lucide-react";

interface CategoryPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = await EditorialService.getCategoryBySlug(slug);

  if (!category) {
    return {
      title: "Categoria não encontrada",
    };
  }

  return {
    title: `${category.name} — Editoria`,
    description: category.description || `Notícias e coberturas sobre ${category.name} no Olhar Museu.`,
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;
  const category = await EditorialService.getCategoryBySlug(slug);

  if (!category) {
    notFound();
  }

  const { posts } = await EditorialService.getFilteredPosts({
    categorySlug: category.slug,
    limit: 12,
  });

  return (
    <div className="space-y-10">
      {/* Breadcrumbs */}
      <Breadcrumbs
        items={[
          { label: "Notícias", href: "/noticias" },
          { label: `Editoria: ${category.name}` },
        ]}
      />

      {/* Cabeçalho da Editoria */}
      <header className="space-y-3 pb-6 border-b-2 border-night">
        <div className="flex items-center gap-2 font-mono text-xs font-bold text-gold uppercase tracking-widest">
          <Sparkles className="w-4 h-4" />
          <span>Editoria Temática</span>
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-night tracking-tight">
          {category.name}
        </h1>
        {category.description && (
          <p className="font-sans text-sm sm:text-base text-blue-deep max-w-2xl leading-relaxed">
            {category.description}
          </p>
        )}
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
          title={`Nenhuma notícia em ${category.name}`}
          description="Ainda não foram publicadas matérias para esta editoria."
          actionHref="/noticias"
          actionLabel="Ver todas as notícias"
        />
      )}
    </div>
  );
}
