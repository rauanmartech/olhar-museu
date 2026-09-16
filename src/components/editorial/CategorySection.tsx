import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Category, Post } from "@/types/editorial";
import { NewsCard } from "./NewsCard";

interface CategorySectionProps {
  category: Category;
  posts: Post[];
}

export function CategorySection({ category, posts }: CategorySectionProps) {
  if (!posts || posts.length === 0) return null;

  const mainPost = posts[0];
  const secondaryPosts = posts.slice(1, 4);

  return (
    <section className="w-full space-y-6" aria-label={`Editoria ${category.name}`}>
      {/* Header da Categoria */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 pb-3 border-b-2 border-night">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="w-2 h-4 bg-gold inline-block" />
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-night tracking-tight">
              {category.name}
            </h2>
          </div>
          {category.description && (
            <p className="text-xs text-stone-dark font-sans max-w-xl">
              {category.description}
            </p>
          )}
        </div>

        <Link
          href={`/categoria/${category.slug}`}
          className="inline-flex items-center gap-1 font-mono text-xs text-night font-bold hover:text-gold uppercase tracking-wider transition-colors shrink-0 group"
        >
          <span>Ver mais em {category.name}</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      {/* Grid: 1 Principal + Secundárias */}
      <div className={`grid grid-cols-1 ${secondaryPosts.length > 0 ? "lg:grid-cols-12 gap-6 items-start" : ""}`}>
        <div className={secondaryPosts.length > 0 ? "lg:col-span-7" : "w-full"}>
          <NewsCard post={mainPost} variant="standard" />
        </div>

        {secondaryPosts.length > 0 && (
          <div className="lg:col-span-5 bg-white border border-stone p-5 sm:p-6 divide-y divide-stone/40">
            {secondaryPosts.map((post) => (
              <NewsCard key={post.id} post={post} variant="compact" />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
