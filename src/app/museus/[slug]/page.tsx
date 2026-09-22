import React from "react";
import { notFound } from "next/navigation";
import Image from "next/image";
import type { Metadata } from "next";
import { EditorialService } from "@/lib/services/editorialService";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { NewsCard } from "@/components/editorial/NewsCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { Landmark, MapPin, Globe, ExternalLink } from "lucide-react";

interface MuseumPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({ params }: MuseumPageProps): Promise<Metadata> {
  const { slug } = await params;
  const museum = await EditorialService.getMuseumBySlug(slug);

  if (!museum) {
    return {
      title: "Instituição não encontrada",
    };
  }

  return {
    title: `${museum.name} — Cobertura Editorial`,
    description: museum.description || `Notícias, exposições e acervos do ${museum.name} no Olhar Museu.`,
  };
}

export default async function MuseumPage({ params }: MuseumPageProps) {
  const { slug } = await params;
  const museum = await EditorialService.getMuseumBySlug(slug);

  if (!museum) {
    notFound();
  }

  const { posts } = await EditorialService.getFilteredPosts({
    museumSlug: museum.slug,
    limit: 12,
  });

  return (
    <div className="space-y-10">
      {/* Breadcrumbs */}
      <Breadcrumbs
        items={[
          { label: "Notícias", href: "/noticias" },
          { label: `Museu: ${museum.name}` },
        ]}
      />

      {/* Perfil Institucional do Museu */}
      <header className="bg-white border border-stone p-6 sm:p-8 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
          {/* Foto do Museu */}
          <div className="md:col-span-4 relative aspect-[16/10] w-full overflow-hidden bg-ivory border border-stone">
            {museum.image_url ? (
              <Image
                src={museum.image_url}
                alt={museum.name}
                fill
                priority
                sizes="(max-width: 768px) 100vw, 33vw"
                className="object-cover"
              />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-stone-dark bg-ivory">
                <Landmark className="w-10 h-10 opacity-30" />
                <span className="font-mono text-xs opacity-40">Sem imagem</span>
              </div>
            )}
          </div>

          {/* Dados e Descrição */}
          <div className="md:col-span-8 space-y-3">
            <div className="flex items-center gap-2 font-mono text-xs font-bold text-gold uppercase tracking-widest">
              <Landmark className="w-4 h-4" />
              <span>Instituição de Memória</span>
            </div>

            <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-night tracking-tight">
              {museum.name}
            </h1>

            {museum.description && (
              <p className="text-xs sm:text-sm text-blue-deep font-sans leading-relaxed">
                {museum.description}
              </p>
            )}

            <div className="pt-2 border-t border-stone/50 flex flex-wrap items-center gap-4 text-xs font-mono text-stone-dark">
              {museum.address && (
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-gold shrink-0" />
                  <span>{museum.address}</span>
                </div>
              )}
              {museum.website && (
                <a
                  href={museum.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-gold hover:underline"
                >
                  <Globe className="w-3.5 h-3.5" />
                  <span>Site Oficial</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Grid de Notícias Deste Museu */}
      <section className="space-y-6">
        <div className="flex items-center justify-between pb-3 border-b-2 border-night">
          <h2 className="font-serif text-2xl font-bold text-night">
            Publicações & Notícias Vinculadas
          </h2>
          <span className="font-mono text-xs text-stone-dark">
            {posts.length} {posts.length === 1 ? "matéria" : "matérias"}
          </span>
        </div>

        {posts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
              <NewsCard key={post.id} post={post} variant="standard" />
            ))}
          </div>
        ) : (
          <EmptyState
            title={`Nenhuma notícia vinculada ao ${museum.name}`}
            description="Não foram encontradas matérias específicas para esta instituição no momento."
            actionHref="/noticias"
            actionLabel="Ver todas as notícias"
          />
        )}
      </section>
    </div>
  );
}
