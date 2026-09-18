import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Button } from "@/components/ui/Button";
import { 
  Sparkles, 
  Newspaper, 
  Landmark, 
  BookOpen, 
  ShieldCheck, 
  Compass 
} from "lucide-react";

export const metadata: Metadata = {
  title: "Quem Somos & Manifesto Editorial",
  description:
    "Conheça o propósito, a equipe e as diretrizes editoriais do Olhar Museu, iniciativa jornalística vinculada ao SiMOP em Ouro Preto.",
};

export default function QuemSomosPage() {
  const pillars = [
    {
      title: "Cobertura Jornalística",
      description: "Acompanhamento rigoroso de aberturas de exposições, descobertas históricas, seminários e intervenções de restauro em Ouro Preto.",
      icon: Newspaper,
    },
    {
      title: "Memória & Documentação",
      description: "Preservação e difusão de arquivos raros, manuscritos, ensaios iconográficos e depoimentos de mestres e conservadores.",
      icon: BookOpen,
    },
    {
      title: "Cultura & Museologia",
      description: "Articulação contínua com os doze museus municipais, estaduais, federais e comunitários que integram a rede de memória.",
      icon: Landmark,
    },
    {
      title: "Diálogo & Formação",
      description: "Estímulo à pesquisa acadêmica, projetos de educação museal e valorização da comunidade e dos distritos históricos.",
      icon: Compass,
    },
  ];

  return (
    <div className="space-y-16 max-w-4xl mx-auto">
      {/* Breadcrumbs */}
      <Breadcrumbs items={[{ label: "Quem Somos" }]} />

      {/* Cabeçalho / Manifesto */}
      <header className="space-y-6 text-center sm:text-left border-b-2 border-night pb-10">
        <div className="flex items-center justify-center sm:justify-start gap-2 font-mono text-xs font-bold text-gold uppercase tracking-widest">
          <Sparkles className="w-4 h-4" />
          <span>Manifesto Editorial</span>
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-night leading-tight tracking-tight">
          O jornalismo como instrumento de memória, preservação e difusão cultural
        </h1>
        <p className="font-sans text-base sm:text-xl text-blue-deep font-normal leading-relaxed">
          O <strong>Olhar Museu</strong> é uma plataforma jornalística e editorial dedicada a documentar, interpretar e dar visibilidade contínua ao patrimônio cultural e às instituições museais de Ouro Preto.
        </p>
      </header>

      {/* Seção: Sobre o Projeto */}
      <section className="space-y-6">
        <div className="flex items-center gap-2 pb-2 border-b border-stone">
          <span className="w-2 h-4 bg-gold inline-block" />
          <h2 className="font-serif text-2xl font-bold text-night">
            Sobre o Olhar Museu
          </h2>
        </div>

        <div className="prose text-night font-sans text-base sm:text-lg leading-relaxed space-y-4">
          <p className="drop-cap leading-relaxed">
            Nascido a partir da necessidade de ampliar o alcance das ações culturais desenvolvidas em Ouro Preto, o Olhar Museu estabelece uma ponte qualificada entre as pesquisas científicas dos acervos e o público leitor. Mais do que noticiar eventos, buscamos contextualizar as camadas históricas que tornam esta cidade um monumento vivo da humanidade.
          </p>
          <p>
            Através de ensaios curadoriais, perfis de conservadores, registros de bastidores e matérias especiais, acompanhamos o cotidiano dos museus e os desafios contemporâneos da preservação patrimonial no Brasil.
          </p>
        </div>
      </section>

      {/* Seção: Pilares Editoriais */}
      <section className="space-y-6">
        <div className="flex items-center gap-2 pb-2 border-b border-stone">
          <span className="w-2 h-4 bg-gold inline-block" />
          <h2 className="font-serif text-2xl font-bold text-night">
            Pilares da Nossa Atuação
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {pillars.map((pillar) => {
            const Icon = pillar.icon;
            return (
              <div key={pillar.title} className="p-6 bg-white border border-stone space-y-3">
                <div className="w-10 h-10 bg-ivory border border-stone flex items-center justify-center text-gold">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="font-serif text-lg font-bold text-night">
                  {pillar.title}
                </h3>
                <p className="text-xs sm:text-sm text-blue-deep font-sans leading-relaxed">
                  {pillar.description}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Seção: Relação com o SiMOP */}
      <section id="simop" className="bg-ivory border border-stone p-8 sm:p-10 space-y-4">
        <div className="flex items-center gap-2 text-gold font-mono text-xs uppercase tracking-widest font-bold">
          <ShieldCheck className="w-4 h-4" />
          <span>Vínculo Institucional</span>
        </div>
        <h2 className="font-serif text-2xl font-bold text-night">
          Por Trás do Olhar Museu: O SiMOP
        </h2>
        <p className="text-sm text-blue-deep font-sans leading-relaxed">
          O projeto opera em estreita consonância com o <strong>Sistema de Museus de Ouro Preto (SiMOP)</strong>, beneficiando-se da rede integrada de informações técnicas, inventários de acervo e colaboração direta com os curadores e gestores de cada instituição.
        </p>
      </section>

      {/* Seção: Coordenação Executiva & Equipe Técnica */}
      <section id="equipe" className="space-y-8">
        <div className="flex items-center gap-2 pb-2 border-b border-stone">
          <span className="w-2 h-4 bg-gold inline-block" />
          <h2 className="font-serif text-2xl font-bold text-night">
            Coordenação &amp; Equipe
          </h2>
        </div>

        {/* Coordenação Executiva — layout lado a lado */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Card: Ranielle de Figueiredo */}
          <div className="bg-white border border-stone p-6 space-y-4 flex flex-col items-center text-center">
            <div className="w-36 h-44 overflow-hidden border-2 border-stone/40 relative">
              <Image
                src="/images/ranielle-figueiredo.webp"
                alt="Ranielle de Figueiredo"
                fill
                sizes="144px"
                className="object-cover object-top"
              />
            </div>
            <div className="space-y-2">
              <span className="inline-block font-mono text-[10px] font-bold text-gold uppercase tracking-widest">
                Coordenação Executiva
              </span>
              <h3 className="font-sans text-lg font-bold text-night">Ranielle de Figueiredo</h3>
              <div className="w-8 h-px bg-stone/30 mx-auto" />
              <p className="text-xs text-blue-deep font-sans leading-relaxed">
                Representante do{" "}
                <Link href="/museus/museu-de-ciencia-e-tecnica" className="font-bold text-night hover:text-gold transition-colors">
                  Museu de Ciência e Técnica da Escola de Minas
                </Link>{" "}
                da Universidade Federal de Ouro Preto (UFOP).
              </p>
            </div>
          </div>

          {/* Card: Matheus Bernardes */}
          <div className="bg-white border border-stone p-6 space-y-4 flex flex-col items-center text-center">
            <div className="w-36 h-44 overflow-hidden border-2 border-stone/40 relative">
              <Image
                src="/images/matheus-bernardes.webp"
                alt="Matheus Bernardes"
                fill
                sizes="144px"
                className="object-cover object-top"
              />
            </div>
            <div className="space-y-2">
              <span className="inline-block font-mono text-[10px] font-bold text-gold uppercase tracking-widest">
                Coordenação Executiva
              </span>
              <h3 className="font-sans text-lg font-bold text-night">Matheus Bernardes</h3>
              <div className="w-8 h-px bg-stone/30 mx-auto" />
              <p className="text-xs text-blue-deep font-sans leading-relaxed">
                Representante do{" "}
                <Link href="/museus/museu-casa-dos-contos" className="font-bold text-night hover:text-gold transition-colors">
                  Museu Casa dos Contos
                </Link>
                .
              </p>
            </div>
          </div>
        </div>

        {/* Equipe Técnica — layout horizontal */}
        <div className="space-y-4">
          {/* Card: Stella Ker — sem card no mobile, com card no desktop */}
          <div className="flex flex-row gap-4 items-start sm:bg-white sm:border sm:border-stone sm:p-6 sm:gap-6">
            <div className="flex-shrink-0 w-20 h-20 sm:w-36 sm:h-36 overflow-hidden border border-stone/30 sm:border-2 sm:border-stone/40 relative">
              <Image
                src="/images/stella-ker.webp"
                alt="Stella Ker"
                fill
                sizes="(max-width: 640px) 80px, 144px"
                className="object-cover object-center"
              />
            </div>
            <div className="space-y-1.5 sm:space-y-3 flex-1">
              <div className="flex items-center gap-2">
                <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-gold" />
                <span className="inline-block font-mono text-[9px] sm:text-[10px] font-bold text-gold uppercase tracking-widest border border-gold/40 px-1.5 py-0.5 sm:px-2">
                  Equipe Técnica
                </span>
              </div>
              <h3 className="font-sans text-base sm:text-lg font-bold text-night">Stella Ker</h3>
              <p className="font-mono text-[10px] sm:text-[11px] font-bold text-gold uppercase tracking-wide leading-snug">
                Monitora do Sistema de Museus de Ouro Preto (SiMOP)
              </p>
              <p className="text-xs text-blue-deep font-sans leading-relaxed">
                Atua no suporte e acompanhamento técnico das atividades do Sistema, contribuindo com a articulação de projetos, atendimento aos museus associados e apoio executivo aos planos de ação do SiMOP.
              </p>
            </div>
          </div>
        </div>
      </section>


      {/* CTA para Leitura */}
      <div className="pt-8 text-center space-y-4 border-t border-stone">
        <p className="font-serif text-lg text-night">
          Acompanhe nossas publicações mais recentes no arquivo editorial.
        </p>
        <Link href="/noticias">
          <Button variant="primary" size="md">
            Explorar Notícias do Olhar Museu
          </Button>
        </Link>
      </div>
    </div>
  );
}
