"use client";

import React, { useEffect, useState } from "react";
import { AdminEditorialService, DatabaseTag } from "@/lib/services/adminEditorialService";
import { Tags, Plus, Trash2, Search, Loader2 } from "lucide-react";

export default function AdminTagsPage() {
  const [tags, setTags] = useState<DatabaseTag[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [newTagName, setNewTagName] = useState("");
  const [creating, setCreating] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    loadTags();
  }, []);

  const loadTags = async () => {
    setLoading(true);
    try {
      const data = await AdminEditorialService.getTags();
      setTags(data);
    } catch {
      // Silencioso
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTagName.trim()) return;

    setCreating(true);
    setFeedback(null);

    try {
      const slug = AdminEditorialService.generateSlug(newTagName);
      const tag = await AdminEditorialService.createTag({ name: newTagName.trim(), slug });
      setTags((prev) => [...prev, tag]);
      setNewTagName("");
      setFeedback("Tag criada com sucesso!");
    } catch (err: any) {
      setFeedback("Erro ao criar tag: " + err.message);
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (tag: DatabaseTag) => {
    if (!confirm(`Deseja realmente remover a tag "#${tag.name}"?`)) return;

    try {
      await AdminEditorialService.deleteTag(tag.id);
      setTags((prev) => prev.filter((t) => t.id !== tag.id));
      setFeedback("Tag removida.");
    } catch (err: any) {
      setFeedback("Erro ao excluir tag: " + err.message);
    }
  };

  const filtered = tags.filter((t) =>
    t.name.toLowerCase().includes(search.toLowerCase()) ||
    t.slug.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-[#262626]">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Tags & Palavras-chave Editoriais
          </h1>
          <p className="text-xs sm:text-sm text-stone-dark mt-1 font-sans">
            Indexadores de busca para temas transversais, artistas e séculos.
          </p>
        </div>
      </div>

      {feedback && (
        <div className="p-3 bg-[#1C1C1C] border border-gold/40 rounded text-stone-200 text-xs flex items-center justify-between">
          <span>{feedback}</span>
          <button onClick={() => setFeedback(null)} className="text-stone-dark hover:text-white">
            ✕
          </button>
        </div>
      )}

      {/* Formulário de Criação Rápida */}
      <div className="bg-[#171717] border border-[#282828] p-5 rounded">
        <h2 className="font-serif text-sm font-bold text-white mb-3">Cadastrar Nova Tag</h2>
        <form onSubmit={handleCreate} className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            placeholder="Ex: Aleijadinho, Rococó, Século XVIII..."
            value={newTagName}
            onChange={(e) => setNewTagName(e.target.value)}
            className="flex-1 p-2.5 bg-[#101010] border border-[#333] rounded text-xs text-white placeholder:text-stone-dark focus:outline-none focus:border-gold"
          />
          <button
            type="submit"
            disabled={creating || !newTagName.trim()}
            className="px-5 py-2.5 bg-gold hover:bg-gold-light text-night font-bold text-xs uppercase font-mono tracking-wider rounded transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>{creating ? "Criando..." : "Adicionar Tag"}</span>
          </button>
        </form>
      </div>

      {/* Busca e Lista de Tags */}
      <div className="bg-[#171717] border border-[#282828] rounded p-5 space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 text-stone-dark absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Filtrar tags..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-[#101010] border border-[#333] rounded text-xs text-white focus:outline-none focus:border-gold"
            />
          </div>
          <span className="font-mono text-xs text-stone-dark">
            {filtered.length} tags encontradas
          </span>
        </div>

        {loading ? (
          <div className="py-16 text-center">
            <Loader2 className="w-8 h-8 text-gold animate-spin mx-auto mb-2" />
            <p className="font-mono text-xs text-stone-dark">Carregando tags...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center text-stone-dark text-xs font-sans">
            Nenhuma tag encontrada.
          </div>
        ) : (
          <div className="flex flex-wrap gap-2 pt-2">
            {filtered.map((tag) => (
              <div
                key={tag.id}
                className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#121212] border border-[#2E2E2E] hover:border-gold/50 rounded text-xs font-mono text-stone transition-colors group"
              >
                <span>#{tag.name}</span>
                <span className="text-[10px] text-stone-dark">/{tag.slug}</span>
                <button
                  onClick={() => handleDelete(tag)}
                  className="text-stone-dark hover:text-red-400 opacity-60 group-hover:opacity-100 transition-opacity ml-1"
                  title="Excluir tag"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
