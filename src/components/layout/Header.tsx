"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search, Menu } from "lucide-react";
import { Navbar } from "./Navbar";
import { MobileNav } from "./MobileNav";
import { SearchModal } from "../editorial/SearchModal";

export function Header() {
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Formatação da data atual para o cabeçalho jornalístico
  const todayFormatted = new Intl.DateTimeFormat("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date());

  return (
    <>
      <header className="w-full bg-white border-b border-stone sticky top-0 z-40">
        {/* Barra Superior / Ticker Editorial */}
        <div className="bg-ivory border-b border-stone/70 py-1.5 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto flex items-center justify-between font-mono text-[10px] sm:text-[11px] text-stone-dark uppercase tracking-widest">
            <div className="flex items-center gap-3">
              <span className="font-bold text-night">Ouro Preto, MG</span>
              <span className="hidden sm:inline text-stone">•</span>
              <span className="hidden sm:inline capitalize">{todayFormatted}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-gold font-bold">Portal Cultural SiMOP</span>
              <span className="text-stone">•</span>
              <span className="text-blue-deep font-semibold">Edição Digital</span>
            </div>
          </div>
        </div>

        {/* Masthead Principal */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4 w-full">
            {/* Espaçador Esquerdo */}
            <div></div>

            {/* Logomarca Editorial */}
            <div className="flex justify-center">
              <Link href="/" className="inline-block group">
                <Image 
                  src="/images/olhar-museu-logo-completa.webp" 
                  alt="Olhar Museu" 
                  width={300} 
                  height={100} 
                  className="h-12 sm:h-16 lg:h-20 w-auto object-contain"
                  priority
                />
              </Link>
            </div>

            {/* Ações / Busca / Menu Mobile */}
            <div className="flex items-center justify-end gap-2 sm:gap-3">
              <button
                onClick={() => setIsSearchOpen(true)}
                className="flex items-center gap-2 px-3 py-2 border border-stone bg-ivory text-night hover:border-gold hover:text-gold transition-colors cursor-pointer text-xs font-mono"
                aria-label="Abrir pesquisa"
              >
                <Search className="w-4 h-4 text-gold" />
                <span className="hidden md:inline font-mono">Buscar</span>
              </button>

              {/* Botão Menu Mobile */}
              <button
                onClick={() => setIsMobileNavOpen(true)}
                className="p-2 border border-stone text-night hover:text-gold hover:border-gold transition-colors lg:hidden cursor-pointer"
                aria-label="Abrir menu mobile"
              >
                <Menu className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Barra de Navegação Desktop */}
        <div className="hidden lg:block border-t border-stone bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between py-1">
            <Navbar />
            <div className="font-mono text-[11px] text-stone-dark uppercase tracking-wider">
              <span>Notícias dos Museus de Ouro Preto</span>
            </div>
          </div>
        </div>
      </header>

      {/* Menu Mobile Lateral (Drawer) */}
      <MobileNav
        isOpen={isMobileNavOpen}
        onClose={() => setIsMobileNavOpen(false)}
        onOpenSearch={() => setIsSearchOpen(true)}
      />

      {/* Modal de Busca em Tempo Real */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />
    </>
  );
}
