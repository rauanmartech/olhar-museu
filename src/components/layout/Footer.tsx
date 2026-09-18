import React from "react";
import Link from "next/link";
import Image from "next/image";
import { mockCategories, mockMuseums } from "@/data/mockData";

export function Footer() {
  return (
    <footer className="w-full bg-night text-ivory border-t-4 border-gold mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-12">
        {/* Bloco Superior */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-10 pb-12 border-b border-stone-dark/30">
          {/* Coluna 1: Branding & Missão */}
          <div className="lg:col-span-2 space-y-4">
            <div>
              <Image 
                src="/images/logo-simop-branca.webp" 
                alt="Olhar Museu" 
                width={360} 
                height={120} 
                className="h-16 sm:h-20 w-auto object-contain"
              />
            </div>
            <p className="text-xs sm:text-sm text-stone leading-relaxed font-sans max-w-md">
              Iniciativa editorial independente voltada à cobertura jornalística, divulgação científica, documentação e preservação da memória dos museus e do patrimônio cultural de Ouro Preto.
            </p>
            <div className="pt-2">
              <span className="inline-block px-3 py-1 bg-ivory/10 border border-stone-dark/40 font-mono text-[10px] text-stone uppercase tracking-widest">
                Sistema de Museus de Ouro Preto
              </span>
            </div>
          </div>

          {/* Coluna 2: Editorias */}
          <div className="space-y-3">
            <h4 className="font-mono text-xs font-bold text-gold uppercase tracking-wider pb-1 border-b border-stone-dark/40">
              Editorias
            </h4>
            <ul className="space-y-2 text-xs font-sans text-stone">
              <li>
                <Link href="/noticias" className="hover:text-gold transition-colors block py-0.5">
                  Todas as Notícias
                </Link>
              </li>
              {mockCategories.map((cat) => (
                <li key={cat.id}>
                  <Link
                    href={`/categoria/${cat.slug}`}
                    className="hover:text-gold transition-colors block py-0.5"
                  >
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Coluna 3: Instituições — todas as 12 do banco */}
          <div className="space-y-3">
            <h4 className="font-mono text-xs font-bold text-gold uppercase tracking-wider pb-1 border-b border-stone-dark/40">
              Instituições
            </h4>
            <ul className="space-y-2 text-xs font-sans text-stone">
              {mockMuseums.map((mus) => (
                <li key={mus.id}>
                  <Link
                    href={`/museus/${mus.slug}`}
                    className="hover:text-gold transition-colors block py-0.5 leading-snug"
                  >
                    {mus.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Coluna 4: Institucional */}
          <div className="space-y-3">
            <h4 className="font-mono text-xs font-bold text-gold uppercase tracking-wider pb-1 border-b border-stone-dark/40">
              Sobre o Portal
            </h4>
            <ul className="space-y-2 text-xs font-sans text-stone">
              <li>
                <Link href="/quem-somos" className="hover:text-gold transition-colors block py-0.5">
                  Quem Somos &amp; Manifesto
                </Link>
              </li>
              <li>
                <Link href="/quem-somos#equipe" className="hover:text-gold transition-colors block py-0.5">
                  Conselho Editorial
                </Link>
              </li>
              <li>
                <Link href="/quem-somos#simop" className="hover:text-gold transition-colors block py-0.5">
                  Relação com o SiMOP
                </Link>
              </li>
              <li>
                <Link href="/noticias?filtro=recente" className="hover:text-gold transition-colors block py-0.5">
                  Arquivo de Publicações
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bloco Inferior: Copyright + Desenvolvedor */}
        <div className="flex flex-col items-center sm:flex-row sm:justify-between gap-4 font-mono text-xs text-stone-dark pt-2">
          <p className="text-center sm:text-left">© 2026 Olhar Museu por SiMOP. Todos os direitos reservados.</p>
          <div className="flex flex-row items-center gap-2">
            <span className="text-[10px] text-stone-dark uppercase tracking-widest">Desenvolvido por</span>
            <a
              href="https://www.origemdev.com.br"
              target="_blank"
              rel="noopener noreferrer"
              className="opacity-70 hover:opacity-100 transition-opacity"
              aria-label="OrigemDev — desenvolvimento web"
            >
              <Image
                src="/images/logo-completa-origem.webp"
                alt="OrigemDev"
                width={120}
                height={36}
                className="h-7 w-auto object-contain"
              />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
