import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Newspaper, Home, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="py-16 sm:py-24 text-center max-w-xl mx-auto space-y-6">
      <div className="w-16 h-16 bg-ivory border border-stone flex items-center justify-center mx-auto text-gold">
        <Newspaper className="w-8 h-8" />
      </div>

      <div className="space-y-2">
        <span className="font-mono text-xs text-gold uppercase tracking-widest font-bold">
          Erro 404 · Conteúdo Não Encontrado
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-night">
          Página não encontrada
        </h1>
        <p className="text-sm text-stone-dark font-sans leading-relaxed">
          A reportagem, página ou publicação que você procurou pode ter sido movida, atualizada ou não existe em nossos arquivos.
        </p>
      </div>

      <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
        <Link href="/">
          <Button variant="primary" size="md" className="flex items-center gap-2">
            <Home className="w-4 h-4" />
            <span>Ir para o Início</span>
          </Button>
        </Link>
        <Link href="/noticias">
          <Button variant="outline" size="md" className="flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            <span>Ver Arquivo de Notícias</span>
          </Button>
        </Link>
      </div>
    </div>
  );
}
