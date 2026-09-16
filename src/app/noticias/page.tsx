"use client";

import React, { useState, useEffect, useTransition, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { EditorialService } from "@/lib/services/editorialService";
import { Category, Museum, Tag, Post } from "@/types/editorial";
import { FilterBar } from "@/components/editorial/FilterBar";
import { FilterDrawer } from "@/components/editorial/FilterDrawer";
import { NewsCard } from "@/components/editorial/NewsCard";
import { Pagination } from "@/components/ui/Pagination";
import { EmptyState } from "@/components/ui/EmptyState";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";

function NoticiasContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [, startTransition] = useTransition();

  // Estados dos Filtros
  const initialCategory = searchParams.get("categoria") || "todas";
  const initialMuseum = searchParams.get("museu") || "";
  const initialTag = searchParams.get("tag") || "";
  const initialQuery = searchParams.get("q") || "";
  const initialSort = (searchParams.get("ordem") as "recent" | "popular") || "recent";
  const initialPage = Number(searchParams.get("pagina")) || 1;

  const [categories, setCategories] = useState<Category[]>([]);
  const [museums, setMuseums] = useState<Museum[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);

  const [posts, setPosts] = useState<Post[]>([]);
  const [totalPosts, setTotalPosts] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(initialPage);

  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedMuseum, setSelectedMuseum] = useState(initialMuseum);
  const [selectedTag, setSelectedTag] = useState(initialTag);
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [sortBy, setSortBy] = useState<"recent" | "popular">(initialSort);

  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  // Carregar metadados dos filtros
  useEffect(() => {
    async function loadFilterMetadata() {
      const [cats, mus, tgs] = await Promise.all([
        EditorialService.getCategories(),
        EditorialService.getMuseums(),
        EditorialService.getTags(),
      ]);
      setCategories(cats);
      setMuseums(mus);
      setTags(tgs);
    }
    loadFilterMetadata();
  }, []);

  // Atualizar resultados sempre que os filtros mudarem
  useEffect(() => {
    async function fetchPosts() {
      const result = await EditorialService.getFilteredPosts({
        categorySlug: selectedCategory,
        museumSlug: selectedMuseum,
        tagSlug: selectedTag,
        searchQuery,
        sortBy,
        page: currentPage,
        limit: 9,
      });

      setPosts(result.posts);
      setTotalPosts(result.total);
      setTotalPages(result.totalPages);
    }

    fetchPosts();
  }, [selectedCategory, selectedMuseum, selectedTag, searchQuery, sortBy, currentPage]);

  // Sincronizar URL
  const updateUrlParams = (params: Record<string, string | number | undefined>) => {
    startTransition(() => {
      const newParams = new URLSearchParams();
      if (params.categoria && params.categoria !== "todas") newParams.set("categoria", String(params.categoria));
      if (params.museu) newParams.set("museu", String(params.museu));
      if (params.tag) newParams.set("tag", String(params.tag));
      if (params.q) newParams.set("q", String(params.q));
      if (params.ordem && params.ordem !== "recent") newParams.set("ordem", String(params.ordem));
      if (params.pagina && Number(params.pagina) > 1) newParams.set("pagina", String(params.pagina));

      const queryString = newParams.toString();
      router.push(queryString ? `/noticias?${queryString}` : "/noticias", { scroll: false });
    });
  };

  const handleCategoryChange = (slug: string) => {
    setSelectedCategory(slug);
    setCurrentPage(1);
    updateUrlParams({
      categoria: slug,
      museu: selectedMuseum,
      tag: selectedTag,
      q: searchQuery,
      ordem: sortBy,
      pagina: 1,
    });
  };

  const handleMuseumChange = (slug: string) => {
    setSelectedMuseum(slug);
    setCurrentPage(1);
    updateUrlParams({
      categoria: selectedCategory,
      museu: slug,
      tag: selectedTag,
      q: searchQuery,
      ordem: sortBy,
      pagina: 1,
    });
  };

  const handleTagChange = (slug: string) => {
    setSelectedTag(slug);
    setCurrentPage(1);
    updateUrlParams({
      categoria: selectedCategory,
      museu: selectedMuseum,
      tag: slug,
      q: searchQuery,
      ordem: sortBy,
      pagina: 1,
    });
  };

  const handleSearchChange = (q: string) => {
    setSearchQuery(q);
    setCurrentPage(1);
    updateUrlParams({
      categoria: selectedCategory,
      museu: selectedMuseum,
      tag: selectedTag,
      q,
      ordem: sortBy,
      pagina: 1,
    });
  };

  const handleSortChange = (sort: "recent" | "popular") => {
    setSortBy(sort);
    setCurrentPage(1);
    updateUrlParams({
      categoria: selectedCategory,
      museu: selectedMuseum,
      tag: selectedTag,
      q: searchQuery,
      ordem: sort,
      pagina: 1,
    });
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 120, behavior: "smooth" });
    updateUrlParams({
      categoria: selectedCategory,
      museu: selectedMuseum,
      tag: selectedTag,
      q: searchQuery,
      ordem: sortBy,
      pagina: page,
    });
  };

  const handleResetFilters = () => {
    setSelectedCategory("todas");
    setSelectedMuseum("");
    setSelectedTag("");
    setSearchQuery("");
    setSortBy("recent");
    setCurrentPage(1);
    router.push("/noticias");
  };

  return (
    <div className="space-y-8">
      {/* Breadcrumbs */}
      <Breadcrumbs items={[{ label: "Notícias & Arquivo" }]} />

      {/* Cabeçalho da Página */}
      <div className="space-y-2 pb-4 border-b-2 border-night">
        <span className="font-mono text-xs text-gold font-bold uppercase tracking-widest block">
          Arquivo Editorial
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-night tracking-tight">
          Todas as Notícias
        </h1>
        <p className="text-sm sm:text-base text-blue-deep font-sans max-w-2xl leading-relaxed">
          Navegue por matérias completas, coberturas jornalísticas, acervos e acontecimentos dos museus e do patrimônio cultural de Ouro Preto.
        </p>
      </div>

      {/* Barra de Filtros (Desktop & Mobile trigger) */}
      <FilterBar
        categories={categories}
        museums={museums}
        tags={tags}
        selectedCategory={selectedCategory}
        selectedMuseum={selectedMuseum}
        selectedTag={selectedTag}
        searchQuery={searchQuery}
        sortBy={sortBy}
        onSelectCategory={handleCategoryChange}
        onSelectMuseum={handleMuseumChange}
        onSelectTag={handleTagChange}
        onSearchChange={handleSearchChange}
        onSortChange={handleSortChange}
        onResetFilters={handleResetFilters}
        onOpenMobileFilters={() => setIsMobileFiltersOpen(true)}
        totalResults={totalPosts}
      />

      {/* Listagem de Notícias */}
      {posts.length > 0 ? (
        <div className="space-y-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
              <NewsCard key={post.id} post={post} variant="standard" />
            ))}
          </div>

          {/* Paginação */}
          <div className="pt-6 border-t border-stone">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        </div>
      ) : (
        <EmptyState
          title="Nenhuma notícia encontrada para estes filtros"
          description="Tente limpar os filtros aplicados ou alterar os termos pesquisados para encontrar outras matérias."
          actionLabel="Limpar todos os filtros"
          actionHref="#"
        />
      )}

      {/* Gaveta de Filtros Mobile */}
      <FilterDrawer
        isOpen={isMobileFiltersOpen}
        onClose={() => setIsMobileFiltersOpen(false)}
        categories={categories}
        museums={museums}
        tags={tags}
        selectedCategory={selectedCategory}
        selectedMuseum={selectedMuseum}
        selectedTag={selectedTag}
        onSelectCategory={handleCategoryChange}
        onSelectMuseum={handleMuseumChange}
        onSelectTag={handleTagChange}
        onResetFilters={handleResetFilters}
      />
    </div>
  );
}

export default function NoticiasPage() {
  return (
    <Suspense
      fallback={
        <div className="py-16 text-center font-mono text-xs text-stone-dark">
          Carregando arquivo de notícias...
        </div>
      }
    >
      <NoticiasContent />
    </Suspense>
  );
}

