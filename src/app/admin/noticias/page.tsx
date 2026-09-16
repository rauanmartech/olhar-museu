"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { AdminEditorialService, DatabasePost, DatabaseCategory } from "@/lib/services/adminEditorialService";
import {
  FileText,
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  ExternalLink,
  Loader2,
  Star,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
} from "lucide-react";

export default function AdminPostsPage() {
  const [posts, setPosts] = useState<DatabasePost[]>([]);
  const [categories, setCategories] = useState<DatabaseCategory[]>([]);
  const [loading, setLoading] = useState(true);

  // Filtros
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalPosts, setTotalPosts] = useState(0);

  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const loadCategories = React.useCallback(async () => {
    try {
      const cats = await AdminEditorialService.getCategories();
      setCategories(cats);
    } catch {
      // Falha silenciosa ou aguardando configuração
    }
  }, []);

  const loadPosts = React.useCallback(async () => {
    setLoading(true);
    try {
      const data = await AdminEditorialService.getPosts({
        status: statusFilter,
        categoryId: categoryFilter,
        search,
        page,
        limit: 10,
      });

      setPosts(data.posts || []);
      setTotalPages(data.totalPages || 1);
      setTotalPosts(data.total || 0);

      if (data.error) {
        setActionMessage(data.error);
      }
    } catch (err: any) {
      setActionMessage(err?.message || "Aguardando conexão com o banco de dados.");
    } finally {
      setLoading(false);
    }
  }, [statusFilter, categoryFilter, search, page]);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  const handleDelete = async (post: DatabasePost) => {
    if (!confirm(`Deseja realmente excluir permanentemente a matéria "${post.title}"?`)) {
      return;
    }

    setDeletingId(post.id);
    try {
      await AdminEditorialService.deletePost(post.id);
      setPosts((prev) => prev.filter((p) => p.id !== post.id));
      setTotalPosts((prev) => Math.max(0, prev - 1));
      setActionMessage("Publicação excluída com sucesso.");
    } catch (err: any) {
      setActionMessage("Erro ao excluir publicação: " + err.message);
    } finally {
      setDeletingId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PUBLISHED":
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-950/80 text-emerald-300 border border-emerald-800/60">
            PUBLICADO
          </span>
        );
      case "DRAFT":
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-950/80 text-amber-300 border border-amber-800/60">
            RASCUNHO
          </span>
        );
      case "REVIEW":
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-950/80 text-blue-300 border border-blue-800/60">
            EM REVISÃO
          </span>
        );
      case "SCHEDULED":
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-purple-950/80 text-purple-300 border border-purple-800/60">
            AGENDADO
          </span>
        );
      case "ARCHIVED":
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-stone-dark/30 text-stone-dark border border-stone-dark/40">
            ARQUIVADO
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-stone-dark/30 text-stone">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Cabeçalho da Página */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-[#262626]">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Gestão de Notícias & Artigos
          </h1>
          <p className="text-xs sm:text-sm text-stone-dark mt-1 font-sans">
            Gerencie todas as matérias, reportagens, coberturas e colunas do portal.
          </p>
        </div>

        <Link
          href="/admin/noticias/nova"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-gold hover:bg-gold-light text-night font-bold text-xs uppercase tracking-wider rounded transition-all shadow-md hover:shadow-gold/20 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Escrever Nova Notícia</span>
        </Link>
      </div>

      {actionMessage && (
        <div className="p-3.5 bg-[#1C1C1C] border border-gold/40 rounded text-stone-200 text-xs flex items-center justify-between">
          <span>{actionMessage}</span>
          <button onClick={() => setActionMessage(null)} className="text-stone-dark hover:text-white font-mono text-xs">
            ✕
          </button>
        </div>
      )}

      {/* Barra de Filtros e Busca */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-[#171717] border border-[#282828] p-3.5 rounded">
        {/* Busca por Título */}
        <div className="relative">
          <Search className="w-4 h-4 text-stone-dark absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por título..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full pl-9 pr-3 py-2 bg-[#101010] border border-[#333333] rounded text-xs text-white placeholder:text-stone-dark focus:outline-none focus:border-gold"
          />
        </div>

        {/* Filtro por Status */}
        <div>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="w-full px-3 py-2 bg-[#101010] border border-[#333333] rounded text-xs text-white focus:outline-none focus:border-gold"
          >
            <option value="ALL">Todos os Status</option>
            <option value="PUBLISHED">Publicados</option>
            <option value="DRAFT">Rascunhos</option>
            <option value="REVIEW">Em Revisão</option>
            <option value="SCHEDULED">Agendados</option>
            <option value="ARCHIVED">Arquivados</option>
          </select>
        </div>

        {/* Filtro por Categoria */}
        <div>
          <select
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value);
              setPage(1);
            }}
            className="w-full px-3 py-2 bg-[#101010] border border-[#333333] rounded text-xs text-white focus:outline-none focus:border-gold"
          >
            <option value="ALL">Todas as Categorias</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Tabela de Notícias */}
      <div className="bg-[#171717] border border-[#282828] rounded overflow-hidden shadow-lg">
        {loading ? (
          <div className="py-24 text-center">
            <Loader2 className="w-8 h-8 text-gold animate-spin mx-auto mb-2" />
            <p className="font-mono text-xs text-stone-dark">Carregando matérias...</p>
          </div>
        ) : posts.length === 0 ? (
          <div className="py-24 text-center space-y-3">
            <FileText className="w-12 h-12 mx-auto text-stone-dark/30" />
            <p className="text-sm font-sans text-stone-dark">
              Nenhuma matéria encontrada com os filtros selecionados.
            </p>
            <Link
              href="/admin/noticias/nova"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-gold/20 text-gold border border-gold/40 rounded text-xs font-mono hover:bg-gold/30"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Criar nova matéria</span>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#2A2A2A] bg-[#141414] font-mono text-[10px] text-stone-dark uppercase tracking-wider">
                  <th className="py-3.5 px-4">Título da Publicação</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Categoria / Museu</th>
                  <th className="py-3.5 px-4">Data</th>
                  <th className="py-3.5 px-4 text-center">Views</th>
                  <th className="py-3.5 px-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#222222] text-xs font-sans">
                {posts.map((post) => (
                  <tr key={post.id} className="hover:bg-[#1C1C1C] transition-colors group">
                    {/* Título & Destaque */}
                    <td className="py-3.5 px-4 max-w-sm">
                      <div className="flex items-start gap-2">
                        {post.featured && (
                          <span
                            className="mt-0.5 shrink-0 text-gold"
                            title={`Destaque Especial (Posição ${post.featured_position || 1})`}
                          >
                            <Star className="w-3.5 h-3.5 fill-gold" />
                          </span>
                        )}
                        <div className="min-w-0">
                          <Link
                            href={`/admin/noticias/${post.id}`}
                            className="font-serif font-bold text-white group-hover:text-gold transition-colors line-clamp-1 text-sm"
                          >
                            {post.title}
                          </Link>
                          {post.subtitle && (
                            <p className="text-[11px] text-stone-dark line-clamp-1 mt-0.5">
                              {post.subtitle}
                            </p>
                          )}
                          <span className="font-mono text-[10px] text-stone-dark/70 truncate block">
                            /{post.slug}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {getStatusBadge(post.status)}
                    </td>

                    {/* Categoria / Museu */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="space-y-0.5 font-mono text-[11px]">
                        <div className="text-stone font-medium">
                          {post.category?.name || "Geral"}
                        </div>
                        {post.museum && (
                          <div className="text-stone-dark text-[10px]">
                            {post.museum.name}
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Data */}
                    <td className="py-3.5 px-4 whitespace-nowrap font-mono text-[11px] text-stone-dark">
                      {post.published_at
                        ? new Date(post.published_at).toLocaleDateString("pt-BR")
                        : new Date(post.created_at).toLocaleDateString("pt-BR")}
                    </td>

                    {/* Views */}
                    <td className="py-3.5 px-4 text-center font-mono text-[11px] text-stone">
                      {post.views || 0}
                    </td>

                    {/* Ações */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        {post.status === "PUBLISHED" && (
                          <Link
                            href={`/noticias/${post.slug}`}
                            target="_blank"
                            className="p-1.5 text-stone-dark hover:text-gold hover:bg-[#252525] rounded transition-colors"
                            title="Ver no portal"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </Link>
                        )}

                        <Link
                          href={`/admin/noticias/${post.id}`}
                          className="p-1.5 text-stone-dark hover:text-white hover:bg-[#252525] rounded transition-colors"
                          title="Editar matéria"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </Link>

                        <button
                          onClick={() => handleDelete(post)}
                          disabled={deletingId === post.id}
                          className="p-1.5 text-stone-dark hover:text-red-400 hover:bg-red-950/40 rounded transition-colors"
                          title="Excluir matéria"
                        >
                          {deletingId === post.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Trash2 className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Paginação */}
        <div className="p-4 border-t border-[#252525] bg-[#141414] flex items-center justify-between text-xs font-mono text-stone-dark">
          <span>
            Total de <strong>{totalPosts}</strong> publicações cadastradas
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1 || loading}
              className="p-1.5 bg-[#202020] hover:bg-[#2A2A2A] rounded disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span>
              Página {page} de {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages || loading}
              className="p-1.5 bg-[#202020] hover:bg-[#2A2A2A] rounded disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
