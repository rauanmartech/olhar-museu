import React from "react";
import Link from "next/link";
import { EditorialService } from "@/lib/services/editorialService";
import { FeaturedLead } from "@/components/editorial/FeaturedLead";
import { LatestNewsFeed } from "@/components/editorial/LatestNewsFeed";
import { CategorySection } from "@/components/editorial/CategorySection";
import { MuseumSpotlight } from "@/components/editorial/MuseumSpotlight";
import { Button } from "@/components/ui/Button";
import { ArrowRight, BookOpen, ShieldCheck } from "lucide-react";

export const revalidate = 60; // ISR para alta performance e frescor jornalístico

export default async function HomePage() {
  // 1. Destaques principais
  const { lead, secondary } = await EditorialService.getFeaturedPosts();

  // 2. Últimas notícias (excluindo os destaques para não duplicar conteúdo)
  const excludedIds = [
    ...(lead ? [lead.id] : []),
    ...secondary.map((p) => p.id),
  ];
  const latestPosts = await EditorialService.getLatestPosts(6, excludedIds);

  // 3. Categorias estratégicas para a home
  const categoryExposicoes = await EditorialService.getCategoryBySlug("exposicoes");
  const postsExposicoes = (await EditorialService.getFilteredPosts({ categorySlug: "exposicoes", limit: 4 })).posts;

  const categoryPatrimonio = await EditorialService.getCategoryBySlug("patrimonio-restauro");
  const postsPatrimonio = (await EditorialService.getFilteredPosts({ categorySlug: "patrimonio-restauro", limit: 4 })).posts;

  // 4. Museus e notícias associadas
  const museums = await EditorialService.getMuseums();
  const allPublishedPosts = (await EditorialService.getFilteredPosts({ limit: 12 })).posts;

  return (
    <div className="space-y-16 sm:space-y-20">
      {/* 1. SEÇÃO DE DESTAQUE PRINCIPAL (SUPER MANCHETE + SECUNDÁRIAS) */}
      {lead && (
        <FeaturedLead leadPost={lead} secondaryPosts={secondary} />
      )}

      {/* 2. BARRA DE DESTAQUE INSTITUCIONAL / MANIFESTO RÁPIDO */}
      <div className="bg-white border-y-2 border-night p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-1.5 max-w-2xl">
          <div className="flex items-center gap-2 font-mono text-[11px] font-bold text-gold uppercase tracking-widest">
            <ShieldCheck className="w-4 h-4" />
            <span>Compromisso Editorial</span>
          </div>
          <h3 className="font-serif text-xl sm:text-2xl font-bold text-night">
            Um olhar aprofundado sobre o patrimônio vivo de Ouro Preto
          </h3>
          <p className="text-xs sm:text-sm text-blue-deep font-sans leading-relaxed">
            Reportagens especiais, pesquisas documentais e cobertura contínua dos doze museus e espaços de memória que compõem o SiMOP.
          </p>
        </div>
        <Link href="/quem-somos" className="shrink-0">
          <Button variant="outline" size="sm">
            Conheça o Manifesto
          </Button>
        </Link>
      </div>

      {/* 3. FEED DE ÚLTIMAS NOTÍCIAS (CRONOLÓGICO) */}
      <LatestNewsFeed posts={latestPosts} />

      {/* 4. BLOCO POR EDITORIA: EXPOSIÇÕES */}
      {categoryExposicoes && postsExposicoes.length > 0 && (
        <CategorySection
          category={categoryExposicoes}
          posts={postsExposicoes}
        />
      )}

      {/* 5. SEÇÃO: DO UNIVERSO DOS MUSEUS */}
      <MuseumSpotlight museums={museums} posts={allPublishedPosts} />

      {/* 6. BLOCO POR EDITORIA: PATRIMÔNIO & RESTAURO */}
      {categoryPatrimonio && postsPatrimonio.length > 0 && (
        <CategorySection
          category={categoryPatrimonio}
          posts={postsPatrimonio}
        />
      )}

      {/* 7. BANNER DE CHAMADA FINAL / ACERVO COMPLETO */}
      <section className="bg-night text-ivory p-8 sm:p-12 border-2 border-gold flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="space-y-2 max-w-2xl text-center md:text-left">
          <span className="font-mono text-xs text-gold uppercase tracking-widest block font-bold">
            Arquivo Editorial Completo
          </span>
          <h3 className="font-serif text-2xl sm:text-3xl font-bold text-ivory">
            Explore a totalidade de reportagens, acervos e coberturas
          </h3>
          <p className="text-xs sm:text-sm text-stone leading-relaxed font-sans">
            Navegue por filtros temáticos, períodos históricos, coleções de arte sacra e instituições de memória.
          </p>
        </div>
        <Link href="/noticias" className="shrink-0">
          <Button variant="secondary" size="lg" className="flex items-center gap-2">
            <BookOpen className="w-4 h-4" />
            <span>Acessar Arquivo</span>
            <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </Link>
      </section>
    </div>
  );
}
