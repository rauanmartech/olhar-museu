import React from "react";
import Image from "next/image";
import { ArticleBlock } from "@/types/editorial";

interface ArticleContentProps {
  content: {
    blocks: ArticleBlock[];
  } | string;
}

export function ArticleContent({ content }: ArticleContentProps) {
  // Caso seja string simples
  if (typeof content === "string") {
    return (
      <div className="prose max-w-none text-night font-sans text-base sm:text-lg leading-relaxed space-y-6">
        <p className="drop-cap leading-relaxed">{content}</p>
      </div>
    );
  }

  const { blocks } = content;

  return (
    <div className="space-y-6 text-night font-sans text-base sm:text-lg leading-relaxed max-w-[68ch] mx-auto">
      {blocks.map((block, index) => {
        // 1. Parágrafo (primeiro parágrafo ganha drop cap)
        if (block.type === "paragraph") {
          return (
            <p
              key={index}
              className={
                index === 0
                  ? "drop-cap leading-relaxed text-night text-justify sm:text-left"
                  : "leading-relaxed text-night/95 text-justify sm:text-left"
              }
            >
              {block.content}
            </p>
          );
        }

        // 2. Intertítulo (H2 ou H3)
        if (block.type === "heading") {
          const Tag = block.level === 3 ? "h3" : "h2";
          return (
            <div key={index} className="pt-6 pb-2">
              <Tag className="font-serif font-bold text-2xl sm:text-3xl text-night tracking-tight pb-2 border-b border-stone">
                {block.content}
              </Tag>
            </div>
          );
        }

        // 3. Citação / Pull Quote
        if (block.type === "quote") {
          return (
            <blockquote key={index} className="editorial-pull-quote my-8">
              <p className="font-serif italic text-xl sm:text-2xl text-night leading-relaxed mb-2">
                “{block.content}”
              </p>
              {block.author && (
                <footer className="font-mono text-xs text-stone-dark uppercase tracking-widest not-italic">
                  — {block.author}
                </footer>
              )}
            </blockquote>
          );
        }

        // 4. Imagem no corpo da matéria com legenda e crédito
        if (block.type === "image" && block.src) {
          return (
            <figure key={index} className="my-10 space-y-2 border border-stone bg-ivory p-2">
              <div className="relative aspect-[16/10] w-full overflow-hidden bg-stone/40">
                <Image
                  src={block.src}
                  alt={block.alt || "Imagem do artigo"}
                  fill
                  sizes="(max-width: 768px) 100vw, 800px"
                  className="object-cover"
                />
              </div>
              {block.caption && (
                <figcaption className="font-mono text-xs text-stone-dark px-2 py-1 leading-relaxed">
                  {block.caption}
                </figcaption>
              )}
            </figure>
          );
        }

        // 5. Lista
        if (block.type === "list" && block.items) {
          return (
            <ul key={index} className="list-disc list-inside space-y-2 pl-4 text-night my-6">
              {block.items.map((item, i) => (
                <li key={i} className="leading-relaxed">
                  {item}
                </li>
              ))}
            </ul>
          );
        }

        return null;
      })}
    </div>
  );
}
