"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, Landmark, Sparkles, BookOpen } from "lucide-react";
import { mockCategories, mockMuseums } from "@/data/mockData";
import { cn } from "@/lib/utils";

export function Navbar() {
  const pathname = usePathname();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLLIElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsDropdownOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setIsDropdownOpen(false);
    }, 200);
  };

  useEffect(() => {
    setIsDropdownOpen(false);
  }, [pathname]);

  const navItems = [
    { label: "Início", href: "/" },
    { label: "Quem Somos", href: "/quem-somos" },
  ];

  return (
    <nav className="relative z-30" aria-label="Navegação principal">
      <ul className="flex items-center space-x-1 md:space-x-2 font-mono text-xs tracking-wider uppercase">
        {/* Item Início */}
        <li>
          <Link
            href="/"
            className={cn(
              "px-3 py-2 transition-colors duration-150 inline-block font-medium",
              pathname === "/"
                ? "text-gold font-bold border-b-2 border-gold"
                : "text-night hover:text-gold"
            )}
          >
            Início
          </Link>
        </li>

        {/* Dropdown Notícias */}
        <li
          className="relative"
          ref={dropdownRef}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            aria-expanded={isDropdownOpen}
            aria-haspopup="true"
            className={cn(
              "px-3 py-2 transition-colors duration-150 inline-flex items-center gap-1 font-medium cursor-pointer",
              pathname.startsWith("/noticias") || pathname.startsWith("/categoria") || pathname.startsWith("/museus")
                ? "text-gold font-bold border-b-2 border-gold"
                : "text-night hover:text-gold"
            )}
          >
            <span>Notícias</span>
            <ChevronDown
              className={cn(
                "w-3.5 h-3.5 transition-transform duration-200",
                isDropdownOpen ? "rotate-180 text-gold" : "text-stone-dark"
              )}
            />
          </button>

          {/* Mega Menu / Cascading Dropdown */}
          {isDropdownOpen && (
            <div
              className="absolute left-0 top-full w-[640px] bg-white border border-stone shadow-2xl p-6 grid grid-cols-2 gap-8 z-50 animate-in fade-in slide-in-from-top-1 duration-150"
              role="menu"
            >
              {/* Coluna 1: Editorias / Categorias */}
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-stone">
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-gold uppercase tracking-wider">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Editorias</span>
                  </div>
                  <Link
                    href="/noticias"
                    className="text-[10px] text-stone-dark hover:text-gold font-mono lowercase underline"
                  >
                    ver todas →
                  </Link>
                </div>
                <ul className="space-y-1.5">
                  <li>
                    <Link
                      href="/noticias"
                      className="block text-xs text-night font-bold hover:text-gold transition-colors py-1"
                    >
                      Todas as Notícias
                    </Link>
                  </li>
                  {mockCategories.map((cat) => (
                    <li key={cat.id}>
                      <Link
                        href={`/categoria/${cat.slug}`}
                        className="flex items-center justify-between text-xs text-blue-deep hover:text-gold hover:translate-x-0.5 transition-all py-1"
                      >
                        <span>{cat.name}</span>
                        <span className="text-[10px] text-stone-dark font-mono">editoria</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Coluna 2: Por Museu */}
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-stone">
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-blue-deep uppercase tracking-wider">
                    <Landmark className="w-3.5 h-3.5" />
                    <span>Museus em Foco</span>
                  </div>
                  <span className="text-[10px] text-stone-dark font-mono">ouro preto</span>
                </div>
                <ul className="space-y-1.5 max-h-[220px] overflow-y-auto pr-1">
                  {mockMuseums.slice(0, 6).map((mus) => (
                    <li key={mus.id}>
                      <Link
                        href={`/museus/${mus.slug}`}
                        className="block text-xs text-blue-deep hover:text-gold transition-colors py-1 truncate"
                      >
                        {mus.name}
                      </Link>
                    </li>
                  ))}
                </ul>
                <div className="pt-2 border-t border-stone/50">
                  <Link
                    href="/noticias?filtro=museus"
                    className="inline-flex items-center gap-1 text-[11px] text-stone-dark hover:text-gold font-mono"
                  >
                    <BookOpen className="w-3 h-3" />
                    <span>Explorar arquivo por instituição</span>
                  </Link>
                </div>
              </div>
            </div>
          )}
        </li>

        {/* Outros Itens */}
        {navItems.slice(1).map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              className={cn(
                "px-3 py-2 transition-colors duration-150 inline-block font-medium",
                pathname === item.href
                  ? "text-gold font-bold border-b-2 border-gold"
                  : "text-night hover:text-gold"
              )}
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
