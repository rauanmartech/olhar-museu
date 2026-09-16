"use client";

import React, { useEffect, useState, use } from "react";
import { AdminEditorialService, DatabasePost } from "@/lib/services/adminEditorialService";
import { PostForm } from "@/components/admin/PostForm";
import { Loader2, AlertCircle } from "lucide-react";
import Link from "next/link";

export default function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const postId = resolvedParams.id;

  const [post, setPost] = useState<DatabasePost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const data = await AdminEditorialService.getPostById(postId);
        if (!data) {
          setError("Matéria não encontrada.");
        } else {
          setPost(data);
        }
      } catch (err: any) {
        setError(err.message || "Erro ao carregar dados da matéria.");
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [postId]);

  if (loading) {
    return (
      <div className="py-32 text-center flex flex-col items-center justify-center space-y-3">
        <Loader2 className="w-8 h-8 text-gold animate-spin" />
        <p className="font-mono text-xs text-stone-dark">Carregando dados da matéria...</p>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="py-20 text-center space-y-4 max-w-md mx-auto">
        <AlertCircle className="w-10 h-10 text-red-400 mx-auto" />
        <h2 className="font-serif text-lg font-bold text-white">Não foi possível abrir a matéria</h2>
        <p className="text-xs text-stone-dark font-sans">{error || "Matéria inexistente ou excluída."}</p>
        <Link
          href="/admin/noticias"
          className="inline-block px-4 py-2 bg-[#202020] text-stone hover:text-white rounded text-xs font-mono"
        >
          Voltar para Lista de Notícias
        </Link>
      </div>
    );
  }

  return <PostForm initialData={post} isEditing={true} />;
}
