"use client";

import React from "react";
import { Category, Museum, Tag } from "@/types/editorial";
import { X, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface FilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  museums: Museum[];
  tags: Tag[];
  selectedCategory?: string;
  selectedMuseum?: string;
  selectedTag?: string;
  onSelectCategory: (slug: string) => void;
  onSelectMuseum: (slug: string) => void;
  onSelectTag: (slug: string) => void;
  onResetFilters: () => void;
}

export function FilterDrawer({
  isOpen,
  onClose,
  categories,
  museums,
  tags,
  selectedCategory = "todas",
  selectedMuseum = "",
  selectedTag = "",
  onSelectCategory,
  onSelectMuseum,
  onSelectTag,
  onResetFilters,
}: FilterDrawerProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 sm:hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-night/70 backdrop-blur-xs transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div className="fixed inset-y-0 right-0 max-w-xs w-full bg-white shadow-2xl z-50 flex flex-col justify-between overflow-y-auto border-l border-stone p-6 space-y-6 animate-in slide-in-from-right duration-200">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-stone">
            <h3 className="font-serif text-lg font-bold text-night">Filtros Editoriais</h3>
            <button
              onClick={onClose}
              className="p-1 text-stone-dark hover:text-gold cursor-pointer"
              aria-label="Fechar filtros"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Editorias */}
          <div className="space-y-2">
            <span className="font-mono text-xs font-bold text-gold uppercase tracking-wider block">
              Editorias
            </span>
            <div className="flex flex-wrap gap-1.5 font-mono text-xs">
              <button
                onClick={() => onSelectCategory("todas")}
                className={`px-3 py-1.5 border text-xs cursor-pointer ${
                  selectedCategory === "todas"
                    ? "bg-gold text-night border-gold font-bold"
                    : "border-stone text-night bg-ivory"
                }`}
              >
                Todas
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => onSelectCategory(cat.slug)}
                  className={`px-3 py-1.5 border text-xs cursor-pointer ${
                    selectedCategory === cat.slug
                      ? "bg-gold text-night border-gold font-bold"
                      : "border-stone text-night bg-ivory"
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* Museus */}
          <div className="space-y-2">
            <span className="font-mono text-xs font-bold text-blue-deep uppercase tracking-wider block">
              Instituição / Museu
            </span>
            <select
              value={selectedMuseum}
              onChange={(e) => onSelectMuseum(e.target.value)}
              aria-label="Filtrar por instituição ou museu"
              className="w-full p-2.5 bg-ivory border border-stone font-mono text-xs text-night outline-none"
            >
              <option value="">Todas as instituições</option>
              {museums.map((mus) => (
                <option key={mus.id} value={mus.slug}>
                  {mus.name}
                </option>
              ))}
            </select>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <span className="font-mono text-xs font-bold text-stone-dark uppercase tracking-wider block">
              Tópicos & Tags
            </span>
            <div className="flex flex-wrap gap-1.5 font-mono text-xs">
              {tags.map((t) => (
                <button
                  key={t.id}
                  onClick={() => onSelectTag(selectedTag === t.slug ? "" : t.slug)}
                  className={`px-2 py-1 border text-xs cursor-pointer ${
                    selectedTag === t.slug
                      ? "bg-night text-ivory border-night font-bold"
                      : "border-stone text-stone-dark bg-ivory"
                  }`}
                >
                  #{t.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Ações Inferiores */}
        <div className="pt-4 border-t border-stone space-y-3">
          <Button variant="primary" size="md" className="w-full" onClick={onClose}>
            Aplicar Filtros
          </Button>
          <button
            onClick={() => {
              onResetFilters();
              onClose();
            }}
            className="w-full flex items-center justify-center gap-1.5 font-mono text-xs text-stone-dark hover:text-gold py-1 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Redefinir Tudo</span>
          </button>
        </div>
      </div>
    </div>
  );
}
