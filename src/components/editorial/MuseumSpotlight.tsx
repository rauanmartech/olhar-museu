import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Landmark, ArrowRight } from "lucide-react";
import { Museum, Post } from "@/types/editorial";
import { formatShortDate } from "@/lib/utils";

interface MuseumSpotlightProps {
  museums: Museum[];
  posts: Post[];
}

export function MuseumSpotlight({ museums, posts }: MuseumSpotlightProps) {
  return (
    <section className="w-full bg-ivory border border-stone p-6 sm:p-10 space-y-8" aria-label="Museus em Foco">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-stone">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-gold font-mono text-xs uppercase tracking-widest font-bold">
            <Landmark className="w-4 h-4" />
            <span>Circuito de Ouro Preto</span>
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-night tracking-tight">
            Do Universo dos Museus
          </h2>
          <p className="text-xs sm:text-sm text-stone-dark font-sans max-w-xl">
            Acompanhe notícias, descobertas e iniciativas diretamente conectadas às instituições de memória da cidade.
          </p>
        </div>

        <Link
          href="/noticias?filtro=museus"
          className="inline-flex items-center gap-1 font-mono text-xs text-night font-bold hover:text-gold uppercase tracking-wider transition-colors shrink-0 group"
        >
          <span>Ver todas por museu</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      {/* Grid de Museus com Notícias Relacionadas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {museums.slice(0, 3).map((mus) => {
          const museumPosts = posts.filter((p) => p.museum?.id === mus.id);
          const topPost = museumPosts[0];

          return (
            <div key={mus.id} className="bg-white border border-stone p-6 flex flex-col justify-between space-y-4 group">
              <div className="space-y-4">
                {/* Imagem do Museu com Banner Institucional */}
                <div className="relative aspect-[16/9] w-full overflow-hidden bg-stone/30 border border-stone/50">
                  {mus.image_url || topPost?.featured_image?.url ? (
                    <Image
                      src={mus.image_url || topPost?.featured_image?.url || ""}
                      alt={mus.name}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <Image
                      src={`/images/museus/${mus.slug}/capa.webp`}
                      alt={mus.name}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      onError={(e) => {
                        // fallback visual caso não exista no public
                        (e.currentTarget as HTMLElement).style.display = "none";
                      }}
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-night/80 via-transparent to-transparent flex items-end p-3 pointer-events-none">
                    <span className="font-sans text-sm font-bold text-white leading-snug">
                      {mus.name}
                    </span>
                  </div>
                </div>

                {/* Notícia mais recente deste museu */}
                {topPost ? (
                  <div className="space-y-1.5 pt-2">
                    <span className="font-mono text-[10px] text-gold font-bold uppercase tracking-wider block">
                      Última Cobertura · {formatShortDate(topPost.published_at)}
                    </span>
                    <Link href={`/noticias/${topPost.slug}`} className="block">
                      <h4 className="font-sans text-sm font-bold text-night hover:text-gold transition-colors leading-snug line-clamp-2">
                        {topPost.title}
                      </h4>
                    </Link>
                    <p className="text-xs text-stone-dark line-clamp-2 font-sans">
                      {topPost.excerpt}
                    </p>
                  </div>
                ) : (
                  <p className="text-xs text-stone-dark font-mono py-2">
                    Nenhuma notícia vinculada no momento.
                  </p>
                )}
              </div>

              {/* Link para página do museu */}
              <div className="pt-3 border-t border-stone/40">
                <Link
                  href={`/museus/${mus.slug}`}
                  className="inline-flex items-center justify-between w-full font-mono text-[11px] text-stone-dark hover:text-gold transition-colors"
                >
                  <span>Ver arquivo da instituição</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
