"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { X, ChevronDown, Sparkles, Landmark, Search } from "lucide-react";
import { mockCategories, mockMuseums } from "@/data/mockData";

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenSearch: () => void;
}

export function MobileNav({ isOpen, onClose, onOpenSearch }: MobileNavProps) {
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(true);
  const [isMuseumsOpen, setIsMuseumsOpen] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-night/70 backdrop-blur-xs transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div className="fixed inset-y-0 right-0 max-w-xs w-full bg-white shadow-2xl z-50 flex flex-col justify-between overflow-y-auto border-l border-stone animate-in slide-in-from-right duration-200">
        <div className="p-6 space-y-6">
          {/* Header do Drawer */}
          <div className="flex items-center justify-between pb-4 border-b border-stone">
            <div>
              <Image 
                src="/images/logo-simop-preta.webp" 
                alt="Olhar Museu" 
                width={180} 
                height={60} 
                className="h-8 w-auto object-contain"
              />
            </div>
            <button
              onClick={onClose}
              className="p-1.5 border border-stone text-night hover:text-gold hover:border-gold transition-colors cursor-pointer"
              aria-label="Fechar menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Busca Rápida no Mobile */}
          <button
            onClick={() => {
              onClose();
              onOpenSearch();
            }}
            className="w-full flex items-center justify-between px-4 py-2.5 bg-ivory border border-stone text-xs font-mono text-stone-dark hover:border-gold hover:text-night transition-colors cursor-pointer"
          >
            <span className="flex items-center gap-2">
              <Search className="w-4 h-4 text-gold" />
              <span>Buscar matérias e acervos...</span>
            </span>
          </button>

          {/* Links Principais */}
          <nav className="space-y-4 font-mono text-sm uppercase tracking-wider">
            <Link
              href="/"
              onClick={onClose}
              className="block py-2 text-night font-bold hover:text-gold border-b border-stone/50 transition-colors"
            >
              Início
            </Link>

            <Link
              href="/noticias"
              onClick={onClose}
              className="block py-2 text-night font-bold hover:text-gold border-b border-stone/50 transition-colors"
            >
              Todas as Notícias
            </Link>

            {/* Accordion Editorias */}
            <div className="border-b border-stone/50 pb-2">
              <button
                onClick={() => setIsCategoriesOpen(!isCategoriesOpen)}
                className="w-full flex items-center justify-between py-2 text-night font-bold hover:text-gold text-left cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-gold" />
                  <span>Editorias</span>
                </span>
                <ChevronDown
                  className={`w-4 h-4 transition-transform ${
                    isCategoriesOpen ? "rotate-180 text-gold" : "text-stone-dark"
                  }`}
                />
              </button>
              {isCategoriesOpen && (
                <ul className="pl-4 pr-1 py-2 space-y-2 border-l border-stone text-xs font-normal lowercase tracking-normal">
                  {mockCategories.map((cat) => (
                    <li key={cat.id}>
                      <Link
                        href={`/categoria/${cat.slug}`}
                        onClick={onClose}
                        className="block text-blue-deep hover:text-gold py-1 capitalize"
                      >
                        {cat.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Accordion Museus */}
            <div className="border-b border-stone/50 pb-2">
              <button
                onClick={() => setIsMuseumsOpen(!isMuseumsOpen)}
                className="w-full flex items-center justify-between py-2 text-night font-bold hover:text-gold text-left cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <Landmark className="w-3.5 h-3.5 text-blue-deep" />
                  <span>Museus</span>
                </span>
                <ChevronDown
                  className={`w-4 h-4 transition-transform ${
                    isMuseumsOpen ? "rotate-180 text-gold" : "text-stone-dark"
                  }`}
                />
              </button>
              {isMuseumsOpen && (
                <ul className="pl-4 pr-1 py-2 space-y-2 border-l border-stone text-xs font-normal tracking-normal max-h-48 overflow-y-auto">
                  {mockMuseums.map((mus) => (
                    <li key={mus.id}>
                      <Link
                        href={`/museus/${mus.slug}`}
                        onClick={onClose}
                        className="block text-blue-deep hover:text-gold py-1 truncate"
                      >
                        {mus.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <Link
              href="/quem-somos"
              onClick={onClose}
              className="block py-2 text-night font-bold hover:text-gold border-b border-stone/50 transition-colors"
            >
              Quem Somos
            </Link>
          </nav>
        </div>

        {/* Footer do Drawer */}
        <div className="p-6 bg-ivory border-t border-stone space-y-2 text-center font-mono text-[11px] text-stone-dark">
          <p>Ouro Preto, Minas Gerais</p>
          <p className="text-night font-bold">Portal Editorial do SiMOP</p>
        </div>
      </div>
    </div>
  );
}
