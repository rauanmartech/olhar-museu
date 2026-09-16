"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Search, X, ArrowRight, Newspaper } from "lucide-react";
import { EditorialService } from "@/lib/services/editorialService";
import { Post } from "@/types/editorial";
import { Badge } from "@/components/ui/Badge";
import { formatShortDate } from "@/lib/utils";

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Post[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      setQuery("");
      setResults([]);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const debounce = setTimeout(async () => {
      const data = await EditorialService.getFilteredPosts({ searchQuery: query, limit: 5 });
      setResults(data.posts);
      setIsSearching(false);
    }, 250);

    return () => clearTimeout(debounce);
  }, [query]);

  // Fechar com tecla Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-night/80 backdrop-blur-xs transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-2xl bg-white border border-stone shadow-2xl p-6 space-y-6 z-10 animate-in fade-in zoom-in-95 duration-150">
        {/* Campo de Entrada */}
        <div className="relative flex items-center border-b-2 border-night pb-3">
          <Search className="w-5 h-5 text-gold mr-3 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por notícias, temas, museus ou artistas..."
            className="w-full bg-transparent text-night text-base sm:text-lg font-serif placeholder:font-sans placeholder:text-stone-dark outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="p-1 text-stone-dark hover:text-night cursor-pointer mr-2"
              aria-label="Limpar busca"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1 text-stone-dark hover:text-gold cursor-pointer"
            aria-label="Fechar busca"
          >
            <span className="font-mono text-xs uppercase tracking-wider hidden sm:inline">ESC</span>
          </button>
        </div>

        {/* Resultados */}
        <div className="space-y-4 max-h-[380px] overflow-y-auto pr-1">
          {isSearching && (
            <p className="font-mono text-xs text-stone-dark text-center py-4">
              Pesquisando no arquivo editorial...
            </p>
          )}

          {!isSearching && query && results.length === 0 && (
            <div className="text-center py-8 space-y-2">
              <Newspaper className="w-8 h-8 text-stone-dark/50 mx-auto" />
              <p className="font-serif text-night font-bold">Nenhum resultado encontrado</p>
              <p className="text-xs text-stone-dark font-sans">
                Tente buscar por &quot;Inconfidência&quot;, &quot;Restauro&quot;, &quot;Oratório&quot; ou &quot;Aleijadinho&quot;.
              </p>
            </div>
          )}

          {!isSearching && results.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between font-mono text-[11px] text-stone-dark uppercase tracking-wider pb-1 border-b border-stone/50">
                <span>{results.length} resultados encontrados</span>
                <Link
                  href={`/noticias?q=${encodeURIComponent(query)}`}
                  onClick={onClose}
                  className="text-gold hover:underline"
                >
                  Ver todos os resultados →
                </Link>
              </div>

              {results.map((post) => (
                <Link
                  key={post.id}
                  href={`/noticias/${post.slug}`}
                  onClick={onClose}
                  className="group block p-3 bg-ivory/50 border border-stone hover:border-gold hover:bg-white transition-all"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="gold" size="sm">
                          {post.category.name}
                        </Badge>
                        <span className="text-[10px] font-mono text-stone-dark">
                          {formatShortDate(post.published_at)}
                        </span>
                      </div>
                      <h4 className="font-sans font-bold text-sm sm:text-base text-night group-hover:text-gold transition-colors leading-snug">
                        {post.title}
                      </h4>
                      <p className="text-xs text-blue-deep line-clamp-1 font-sans">
                        {post.excerpt}
                      </p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-stone-dark group-hover:text-gold group-hover:translate-x-0.5 transition-all shrink-0 mt-2" />
                  </div>
                </Link>
              ))}
            </div>
          )}

          {!query && (
            <div className="py-4 space-y-3">
              <span className="font-mono text-[11px] text-stone-dark uppercase tracking-wider block">
                Sugestões de busca editorial
              </span>
              <div className="flex flex-wrap gap-2">
                {[
                  "Inconfidência Mineira",
                  "Restauro e Preservação",
                  "Museu do Oratório",
                  "Mestre Ataíde",
                  "Semana dos Museus",
                  "Arte Sacra",
                ].map((tag) => (
                  <button
                    key={tag}
                    onClick={() => setQuery(tag)}
                    className="px-2.5 py-1 bg-ivory border border-stone text-xs font-mono text-night hover:border-gold hover:text-gold transition-colors cursor-pointer"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
