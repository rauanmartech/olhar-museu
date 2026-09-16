import React from "react";
import { Post } from "@/types/editorial";
import { NewsCard } from "./NewsCard";
import { Sparkles } from "lucide-react";

interface FeaturedLeadProps {
  leadPost: Post;
  secondaryPosts: Post[];
}

export function FeaturedLead({ leadPost, secondaryPosts }: FeaturedLeadProps) {
  return (
    <section className="w-full space-y-4" aria-label="Destaques Principais">
      <div className="flex items-center justify-between pb-2 border-b-2 border-night">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 bg-gold inline-block" />
          <h2 className="font-mono text-xs font-bold tracking-widest uppercase text-night">
            Em Destaque
          </h2>
        </div>
        <span className="font-mono text-[11px] text-stone-dark tracking-wider uppercase">
          Principais Matérias
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Super Manchete Principal (8 colunas) */}
        <div className="lg:col-span-8">
          <NewsCard post={leadPost} variant="lead" />
        </div>

        {/* Destaques Secundários (4 colunas) */}
        <div className="lg:col-span-4 bg-white border border-stone p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-stone">
            <div className="flex items-center gap-1.5 font-mono text-[11px] font-bold text-gold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Outras Leituras</span>
            </div>
            <span className="text-[10px] font-mono text-stone-dark">ouro preto</span>
          </div>

          <div className="divide-y divide-stone/40">
            {secondaryPosts.map((post) => (
              <NewsCard key={post.id} post={post} variant="compact" />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
