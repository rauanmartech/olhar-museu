import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  className,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <nav
      aria-label="Paginação"
      className={cn("flex items-center justify-center space-x-1.5 font-mono text-xs", className)}
    >
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-3 py-2 border border-stone text-night hover:border-gold hover:text-gold disabled:opacity-30 disabled:hover:border-stone disabled:hover:text-night transition-colors cursor-pointer flex items-center gap-1"
        aria-label="Página anterior"
      >
        <ChevronLeft className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">Anterior</span>
      </button>

      {pages.map((page) => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={cn(
            "w-9 h-9 border transition-colors cursor-pointer flex items-center justify-center",
            page === currentPage
              ? "bg-night text-ivory border-night font-bold"
              : "border-stone text-night hover:border-gold hover:text-gold bg-white"
          )}
          aria-current={page === currentPage ? "page" : undefined}
        >
          {page}
        </button>
      ))}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-3 py-2 border border-stone text-night hover:border-gold hover:text-gold disabled:opacity-30 disabled:hover:border-stone disabled:hover:text-night transition-colors cursor-pointer flex items-center gap-1"
        aria-label="Próxima página"
      >
        <span className="hidden sm:inline">Próxima</span>
        <ChevronRight className="w-3.5 h-3.5" />
      </button>
    </nav>
  );
}
