import React from "react";
import { Newspaper } from "lucide-react";
import { Button } from "./Button";
import Link from "next/link";

interface EmptyStateProps {
  title?: string;
  description?: string;
  actionHref?: string;
  actionLabel?: string;
}

export function EmptyState({
  title = "Nenhuma notícia encontrada",
  description = "Não foram encontrados conteúdos que correspondam aos filtros selecionados. Tente ajustar os termos de busca.",
  actionHref = "/noticias",
  actionLabel = "Ver todas as notícias",
}: EmptyStateProps) {
  return (
    <div className="border border-stone bg-white p-12 text-center space-y-4 max-w-lg mx-auto my-8">
      <div className="w-12 h-12 bg-ivory border border-stone flex items-center justify-center mx-auto text-gold">
        <Newspaper className="w-6 h-6" />
      </div>
      <h3 className="font-serif text-xl font-bold text-night">{title}</h3>
      <p className="text-sm text-stone-dark leading-relaxed font-sans">{description}</p>
      {actionHref && (
        <div className="pt-2">
          <Link href={actionHref}>
            <Button variant="outline" size="sm">
              {actionLabel}
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
