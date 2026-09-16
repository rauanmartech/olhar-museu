"use client";

import React from "react";
import { Category, Museum, Tag } from "@/types/editorial";
import { SlidersHorizontal, RotateCcw, Search } from "lucide-react";
import { cn } from "@/lib/utils";

interface FilterBarProps {
  categories: Category[];
  museums: Museum[];
  tags: Tag[];
  selectedCategory?: string;
  selectedMuseum?: string;
  selectedTag?: string;
  searchQuery?: string;
  sortBy?: "recent" | "popular";
  onSelectCategory: (slug: string) => void;
  onSelectMuseum: (slug: string) => void;
  onSelectTag: (slug: string) => void;
  onSearchChange: (q: string) => void;
  onSortChange: (sort: "recent" | "popular") => void;
  onResetFilters: () => void;
  onOpenMobileFilters: () => void;
  totalResults: number;
}

export function FilterBar({
  categories,
  museums,
  tags,
  selectedCategory = "todas",
  selectedMuseum = "",
  selectedTag = "",
  searchQuery = "",
  sortBy = "recent",
  onSelectCategory,
  onSelectMuseum,
  onSelectTag,
  onSearchChange,
  onSortChange,
  onResetFilters,
  onOpenMobileFilters,
  totalResults,
}: FilterBarProps) {
  const hasActiveFilters =
    selectedCategory !== "todas" || !!selectedMuseum || !!selectedTag || !!searchQuery;

  return (
    <div className="w-full space-y-4 bg-white border border-stone p-4 sm:p-6 mb-8">
      {/* Linha Superior: Busca e Ordenação */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pb-4 border-b border-stone">
        {/* Campo de Busca */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-gold absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Filtrar por palavras-chave..."
            className="w-full pl-9 pr-4 py-2 bg-ivory/60 border border-stone text-xs font-sans text-night placeholder:text-stone-dark outline-none focus:border-gold transition-colors"
          />
        </div>

        {/* Botão Mobile Filter + Ordenação */}
        <div className="flex items-center justify-between sm:justify-end gap-3">
          <button
            onClick={onOpenMobileFilters}
            className="sm:hidden flex items-center gap-2 px-3 py-2 border border-stone bg-ivory text-xs font-mono text-night cursor-pointer"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-gold" />
            <span>Filtros</span>
          </button>

          {/* Seletor de Ordenação */}
          <div className="flex items-center gap-2 font-mono text-xs">
            <span className="text-stone-dark hidden md:inline">Ordenar por:</span>
            <button
              onClick={() => onSortChange("recent")}
              className={cn(
                "px-2.5 py-1.5 border text-xs cursor-pointer transition-colors",
                sortBy === "recent"
                  ? "bg-night text-ivory border-night font-bold"
                  : "border-stone text-night hover:border-gold"
              )}
            >
              Mais Recentes
            </button>
            <button
              onClick={() => onSortChange("popular")}
              className={cn(
                "px-2.5 py-1.5 border text-xs cursor-pointer transition-colors",
                sortBy === "popular"
                  ? "bg-night text-ivory border-night font-bold"
                  : "border-stone text-night hover:border-gold"
              )}
            >
              Mais Lidas
            </button>
          </div>
        </div>
      </div>

      {/* Linha Inferior (Desktop): Categorias e Museus */}
      <div className="hidden sm:block space-y-3">
        {/* Editorias */}
        <div className="flex flex-wrap items-center gap-1.5 font-mono text-xs">
          <span className="text-stone-dark uppercase tracking-wider text-[10px] mr-2">
            Editoria:
          </span>
          <button
            onClick={() => onSelectCategory("todas")}
            className={cn(
              "px-3 py-1 border transition-colors cursor-pointer text-xs",
              selectedCategory === "todas"
                ? "bg-gold text-night border-gold font-bold"
                : "border-stone text-night hover:border-gold bg-ivory/40"
            )}
          >
            Todas
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.slug)}
              className={cn(
                "px-3 py-1 border transition-colors cursor-pointer text-xs",
                selectedCategory === cat.slug
                  ? "bg-gold text-night border-gold font-bold"
                  : "border-stone text-night hover:border-gold bg-ivory/40"
              )}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Museus & Tags */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-stone/50 text-xs">
          {/* Seletor de Museu */}
          <div className="flex items-center gap-2">
            <span className="font-mono text-stone-dark uppercase tracking-wider text-[10px]">
              Por Museu:
            </span>
            <select
              value={selectedMuseum}
              onChange={(e) => onSelectMuseum(e.target.value)}
              aria-label="Filtrar por Museu"
              className="px-3 py-1 bg-ivory border border-stone font-mono text-xs text-night outline-none focus:border-gold cursor-pointer"
            >
              <option value="">Todas as instituições</option>
              {museums.map((mus) => (
                <option key={mus.id} value={mus.slug}>
                  {mus.name}
                </option>
              ))}
            </select>
          </div>

          {/* Tags Populares */}
          <div className="flex items-center gap-1.5 font-mono text-[11px]">
            <span className="text-stone-dark uppercase tracking-wider text-[10px] mr-1">
              Tópicos:
            </span>
            {tags.slice(0, 4).map((t) => (
              <button
                key={t.id}
                onClick={() => onSelectTag(selectedTag === t.slug ? "" : t.slug)}
                className={cn(
                  "px-2 py-0.5 border transition-colors cursor-pointer",
                  selectedTag === t.slug
                    ? "bg-blue-deep text-ivory border-blue-deep"
                    : "border-stone/60 text-stone-dark hover:border-stone hover:text-night"
                )}
              >
                #{t.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Barra de Status e Limpeza de Filtros */}
      <div className="flex items-center justify-between pt-2 text-xs font-mono text-stone-dark">
        <span>
          Mostrando <strong className="text-night">{totalResults}</strong> {totalResults === 1 ? "matéria" : "matérias"}
        </span>

        {hasActiveFilters && (
          <button
            onClick={onResetFilters}
            className="flex items-center gap-1 text-gold hover:text-gold-dark cursor-pointer font-bold uppercase tracking-wider"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Limpar filtros</span>
          </button>
        )}
      </div>
    </div>
  );
}
