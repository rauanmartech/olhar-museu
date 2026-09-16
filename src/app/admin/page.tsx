"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { AdminEditorialService } from "@/lib/services/adminEditorialService";
import {
  FileText,
  CheckCircle2,
  Clock,
  Image as ImageIcon,
  Landmark,
  Plus,
  ArrowUpRight,
  Eye,
  Calendar,
  Layers,
  Sparkles,
} from "lucide-react";

export default function AdminDashboardPage() {
  const [metrics, setMetrics] = useState<{
    totalPosts: number;
    publishedPosts: number;
    draftPosts: number;
    totalMedia: number;
    totalMuseums: number;
    recentPosts: any[];
  }>({
    totalPosts: 0,
    publishedPosts: 0,
    draftPosts: 0,
    totalMedia: 0,
    totalMuseums: 0,
    recentPosts: [],
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await AdminEditorialService.getDashboardMetrics();
        setMetrics(data);
      } catch {
        // Fallback limpo
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

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
            REVISÃO
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
    <div className="space-y-8 animate-fadeIn">
      {/* Cabeçalho da Página */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-[#262626]">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Painel de Controle Editorial
          </h1>
          <p className="text-xs sm:text-sm text-stone-dark mt-1 font-sans">
            Acompanhe o ritmo de publicações, rascunhos e acervos do portal Olhar Museu.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/noticias/nova"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-gold hover:bg-gold-light text-night font-bold text-xs uppercase tracking-wider rounded transition-all shadow-md hover:shadow-gold/20"
          >
            <Plus className="w-4 h-4" />
            <span>Nova Publicação</span>
          </Link>
        </div>
      </div>

      {/* Cards de Métricas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Notícias */}
        <div className="p-5 bg-[#171717] border border-[#2A2A2A] rounded relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[11px] text-stone-dark uppercase tracking-wider">
              Total de Publicações
            </span>
            <div className="p-2 rounded bg-[#222222] text-gold">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <span className="font-serif text-3xl font-bold text-white">
              {loading ? "..." : metrics.totalPosts}
            </span>
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-[11px] text-stone-dark font-mono">
            <span>Posts registrados no banco</span>
          </div>
        </div>

        {/* Publicados */}
        <div className="p-5 bg-[#171717] border border-[#2A2A2A] rounded relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[11px] text-stone-dark uppercase tracking-wider">
              No Ar (Publicados)
            </span>
            <div className="p-2 rounded bg-emerald-950/50 text-emerald-400 border border-emerald-900/40">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <span className="font-serif text-3xl font-bold text-emerald-400">
              {loading ? "..." : metrics.publishedPosts}
            </span>
          </div>
          <div className="mt-2 text-[11px] text-stone-dark font-mono">
            Visíveis no portal público
          </div>
        </div>

        {/* Rascunhos / Em Edição */}
        <div className="p-5 bg-[#171717] border border-[#2A2A2A] rounded relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[11px] text-stone-dark uppercase tracking-wider">
              Rascunhos & Revisão
            </span>
            <div className="p-2 rounded bg-amber-950/50 text-amber-400 border border-amber-900/40">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <span className="font-serif text-3xl font-bold text-amber-400">
              {loading ? "..." : metrics.draftPosts}
            </span>
          </div>
          <div className="mt-2 text-[11px] text-stone-dark font-mono">
            Em preparação pela equipe
          </div>
        </div>

        {/* Biblioteca de Mídia */}
        <div className="p-5 bg-[#171717] border border-[#2A2A2A] rounded relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[11px] text-stone-dark uppercase tracking-wider">
              Acervo de Imagens
            </span>
            <div className="p-2 rounded bg-[#222222] text-blue-300">
              <ImageIcon className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <span className="font-serif text-3xl font-bold text-white">
              {loading ? "..." : metrics.totalMedia}
            </span>
          </div>
          <div className="mt-2 text-[11px] text-stone-dark font-mono">
            Arquivos no Storage SiMOP
          </div>
        </div>
      </div>

      {/* Seção Principal: Ações Rápidas & Últimos Posts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lista de Últimas Notícias (2 Colunas) */}
        <div className="lg:col-span-2 bg-[#171717] border border-[#2A2A2A] rounded p-6">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#252525]">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-gold" />
              <h2 className="font-serif text-lg font-bold text-white">Últimas Publicações</h2>
            </div>
            <Link
              href="/admin/noticias"
              className="text-xs font-mono text-gold hover:underline flex items-center gap-1"
            >
              <span>Ver todas</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {loading ? (
            <div className="py-12 text-center text-stone-dark text-xs font-mono">
              Carregando publicações...
            </div>
          ) : metrics.recentPosts.length === 0 ? (
            <div className="py-12 text-center space-y-3">
              <p className="text-xs text-stone-dark font-sans">
                Nenhuma publicação encontrada no banco de dados.
              </p>
              <Link
                href="/admin/noticias/nova"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gold/20 text-gold border border-gold/40 rounded text-xs font-mono hover:bg-gold/30"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Criar primeira notícia</span>
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-[#222222]">
              {metrics.recentPosts.map((post) => (
                <div
                  key={post.id}
                  className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {getStatusBadge(post.status)}
                      {post.category && (
                        <span className="text-[11px] font-mono text-stone-dark truncate">
                          {post.category.name}
                        </span>
                      )}
                    </div>
                    <Link
                      href={`/admin/noticias/${post.id}`}
                      className="font-serif font-bold text-sm text-stone-100 hover:text-gold transition-colors line-clamp-1"
                    >
                      {post.title}
                    </Link>
                  </div>

                  <div className="flex items-center gap-4 text-xs font-mono text-stone-dark shrink-0">
                    <div className="flex items-center gap-1">
                      <Eye className="w-3.5 h-3.5" />
                      <span>{post.views || 0}</span>
                    </div>
                    <Link
                      href={`/admin/noticias/${post.id}`}
                      className="px-2.5 py-1 bg-[#222222] hover:bg-gold hover:text-night text-stone rounded text-[11px] font-medium transition-colors"
                    >
                      Editar
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Coluna Lateral: Atalhos & Entidades */}
        <div className="space-y-6">
          {/* Caixa de Ações Rápidas */}
          <div className="bg-[#171717] border border-[#2A2A2A] rounded p-6 space-y-4">
            <h3 className="font-serif text-base font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-gold" />
              <span>Atalhos Rápidos</span>
            </h3>

            <div className="space-y-2">
              <Link
                href="/admin/noticias/nova"
                className="flex items-center justify-between p-3 bg-[#1F1F1F] hover:bg-[#282828] border border-[#333333] hover:border-gold/50 rounded transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <Plus className="w-4 h-4 text-gold" />
                  <span className="text-xs font-medium text-stone group-hover:text-white">
                    Redigir Notícia
                  </span>
                </div>
                <ChevronRightIcon className="w-4 h-4 text-stone-dark group-hover:text-gold" />
              </Link>

              <Link
                href="/admin/midia"
                className="flex items-center justify-between p-3 bg-[#1F1F1F] hover:bg-[#282828] border border-[#333333] hover:border-gold/50 rounded transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <ImageIcon className="w-4 h-4 text-gold" />
                  <span className="text-xs font-medium text-stone group-hover:text-white">
                    Subir Imagens no Acervo
                  </span>
                </div>
                <ChevronRightIcon className="w-4 h-4 text-stone-dark group-hover:text-gold" />
              </Link>

              <Link
                href="/admin/categorias"
                className="flex items-center justify-between p-3 bg-[#1F1F1F] hover:bg-[#282828] border border-[#333333] hover:border-gold/50 rounded transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <Layers className="w-4 h-4 text-gold" />
                  <span className="text-xs font-medium text-stone group-hover:text-white">
                    Gerenciar Categorias
                  </span>
                </div>
                <ChevronRightIcon className="w-4 h-4 text-stone-dark group-hover:text-gold" />
              </Link>

              <Link
                href="/admin/museus"
                className="flex items-center justify-between p-3 bg-[#1F1F1F] hover:bg-[#282828] border border-[#333333] hover:border-gold/50 rounded transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <Landmark className="w-4 h-4 text-gold" />
                  <span className="text-xs font-medium text-stone group-hover:text-white">
                    Gerenciar Museus
                  </span>
                </div>
                <ChevronRightIcon className="w-4 h-4 text-stone-dark group-hover:text-gold" />
              </Link>
            </div>
          </div>

          {/* Dica Editorial */}
          <div className="bg-gradient-to-br from-[#1C1813] to-[#171717] border border-gold/30 rounded p-5 space-y-2">
            <span className="font-mono text-[10px] text-gold uppercase tracking-wider font-bold">
              Diretriz Editorial
            </span>
            <p className="text-xs text-stone-dark leading-relaxed font-sans">
              Para matérias de grande relevância, selecione a opção <strong>Super Manchete (Posição 1)</strong> no editor de notícias para colocá-la no topo da página inicial do portal.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function ChevronRightIcon(props: any) {
  return (
    <svg
      {...props}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}
