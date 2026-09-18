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
      {/* sticky em todos os tamanhos — will-change evita tremor de pixel no mobile */}
      <header
        className="w-full bg-night border-b border-stone/30 sticky top-0 z-40 lg:static lg:top-auto lg:z-auto"
        style={{ willChange: "transform", transform: "translateZ(0)" }}
      >
        {/* ── MOBILE: barra única compacta ── */}
        <div className="lg:hidden flex items-center justify-between px-4 py-3">
          {/* Botão busca (esquerda) */}
          <button
            onClick={() => setIsSearchOpen(true)}
            className="p-2 text-ivory hover:text-gold transition-colors cursor-pointer"
            aria-label="Abrir pesquisa"
          >
            <Search className="w-5 h-5" />
          </button>

          {/* Logo centralizada */}
          <Link href="/" className="flex flex-col items-center">
            <Image
              src="/images/logo-simop-branca.webp"
              alt="Olhar Museu"
              width={160}
              height={54}
              className="h-9 w-auto object-contain"
              priority
            />
            <span className="font-mono text-[8px] text-stone/50 uppercase tracking-[0.18em] mt-0.5">
              Olhar Museu — Editorial por SiMOP
            </span>
          </Link>

          {/* Botão menu (direita) */}
          <button
            onClick={() => setIsMobileNavOpen(true)}
            className="p-2 text-ivory hover:text-gold transition-colors cursor-pointer"
            aria-label="Abrir menu mobile"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>

        {/* ── DESKTOP: layout completo ── */}
        <div className="hidden lg:block">
          {/* Barra Superior / Ticker Editorial */}
          <div className="bg-black/20 border-b border-stone/20 py-1.5 px-8">
            <div className="max-w-7xl mx-auto flex items-center justify-between font-mono text-[11px] text-stone/60 uppercase tracking-widest">
              <div className="flex items-center gap-3">
                <span className="font-bold text-ivory">Ouro Preto, MG</span>
                <span className="text-stone/40">•</span>
                <span className="capitalize text-stone/60">{todayFormatted}</span>
              </div>
              <div className="flex items-center gap-3 text-stone/60">
                <span className="text-gold font-bold">Portal Cultural SiMOP</span>
                <span className="text-stone/40">•</span>
                <span className="text-blue-deep font-semibold">Edição Digital</span>
              </div>
            </div>
          </div>

          {/* Masthead Principal */}
          <div className="max-w-7xl mx-auto px-8 py-6">
            <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4 w-full">
              {/* Espaçador Esquerdo */}
              <div></div>

              {/* Logomarca + Identificação */}
              <div className="flex flex-col items-center gap-1">
                <Link href="/" className="inline-block group">
                  <Image
                    src="/images/logo-simop-branca.webp"
                    alt="Olhar Museu"
                    width={300}
                    height={100}
                    className="h-20 w-auto object-contain"
                    priority
                  />
                </Link>
                <p className="font-mono text-[10px] text-stone/50 uppercase tracking-[0.2em] text-center">
                  <span className="text-ivory/70">Olhar Museu</span>
                  <span className="text-stone/30 mx-1.5">—</span>
                  <span>Editorial por SiMOP</span>
                </p>
              </div>

              {/* Busca */}
              <div className="flex items-center justify-end">
                <button
                  onClick={() => setIsSearchOpen(true)}
                  className="flex items-center gap-2 px-3 py-2 border border-stone/30 bg-white/10 text-ivory hover:border-gold hover:text-gold transition-colors cursor-pointer text-xs font-mono"
                  aria-label="Abrir pesquisa"
                >
                  <Search className="w-4 h-4 text-gold" />
                  <span className="font-mono">Buscar</span>
                </button>
              </div>
            </div>
          </div>

          {/* Barra de Navegação Desktop */}
          <div className="border-t border-stone/20 bg-night">
            <div className="max-w-7xl mx-auto px-8 flex items-center justify-between py-1">
              <Navbar />
              <div className="font-mono text-[11px] text-stone/50 uppercase tracking-wider">
                <span>Notícias dos Museus de Ouro Preto</span>
              </div>
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
