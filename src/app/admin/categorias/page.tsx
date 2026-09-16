"use client";

import React, { useEffect, useState } from "react";
import { AdminEditorialService, DatabaseCategory } from "@/lib/services/adminEditorialService";
import {
  FolderTree,
  Plus,
  Edit2,
  Trash2,
  Check,
  X,
  Loader2,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<DatabaseCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCat, setEditingCat] = useState<DatabaseCategory | null>(null);

  // Campos do formulário
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [sortOrder, setSortOrder] = useState<number>(0);
  const [active, setActive] = useState(true);

  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(
    null
  );

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    setLoading(true);
    try {
      const data = await AdminEditorialService.getCategories();
      setCategories(data);
    } catch (err: any) {
      setFeedback({ type: "error", text: "Erro ao carregar categorias." });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setEditingCat(null);
    setName("");
    setSlug("");
    setDescription("");
    setSortOrder(categories.length + 1);
    setActive(true);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (cat: DatabaseCategory) => {
    setEditingCat(cat);
    setName(cat.name);
    setSlug(cat.slug);
    setDescription(cat.description || "");
    setSortOrder(cat.sort_order);
    setActive(cat.active);
    setIsModalOpen(true);
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setName(val);
    if (!editingCat) {
      setSlug(AdminEditorialService.generateSlug(val));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setSaving(true);
    setFeedback(null);

    const payload = {
      name: name.trim(),
      slug: slug.trim() || AdminEditorialService.generateSlug(name),
      description: description.trim() || null,
      sort_order: Number(sortOrder) || 0,
      active,
    };

    try {
      if (editingCat) {
        const updated = await AdminEditorialService.updateCategory(editingCat.id, payload);
        setCategories((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
        setFeedback({ type: "success", text: "Categoria atualizada com sucesso." });
      } else {
        const created = await AdminEditorialService.createCategory(payload as any);
        setCategories((prev) => [...prev, created]);
        setFeedback({ type: "success", text: "Categoria criada com sucesso." });
      }
      setIsModalOpen(false);
    } catch (err: any) {
      setFeedback({ type: "error", text: err.message || "Erro ao salvar categoria." });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (cat: DatabaseCategory) => {
    if (!confirm(`Deseja excluir a categoria "${cat.name}"?`)) return;

    try {
      await AdminEditorialService.deleteCategory(cat.id);
      setCategories((prev) => prev.filter((c) => c.id !== cat.id));
      setFeedback({ type: "success", text: "Categoria excluída com sucesso." });
    } catch (err: any) {
      setFeedback({ type: "error", text: "Erro ao excluir: " + err.message });
    }
  };

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-[#262626]">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Editorias & Categorias
          </h1>
          <p className="text-xs sm:text-sm text-stone-dark mt-1 font-sans">
            Organize os temas de cobertura jornalística do portal.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-gold hover:bg-gold-light text-night font-bold text-xs uppercase tracking-wider rounded transition-all shadow-md self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Nova Categoria</span>
        </button>
      </div>

      {/* Feedback */}
      {feedback && (
        <div
          className={`p-3.5 rounded text-xs flex items-center justify-between ${
            feedback.type === "success"
              ? "bg-emerald-950/70 border border-emerald-800 text-emerald-200"
              : "bg-red-950/70 border border-red-800 text-red-200"
          }`}
        >
          <span>{feedback.text}</span>
          <button onClick={() => setFeedback(null)} className="text-stone-dark hover:text-white">
            ✕
          </button>
        </div>
      )}

      {/* Lista de Categorias */}
      <div className="bg-[#171717] border border-[#282828] rounded overflow-hidden shadow-lg">
        {loading ? (
          <div className="py-20 text-center flex flex-col items-center justify-center">
            <Loader2 className="w-8 h-8 text-gold animate-spin mb-2" />
            <p className="font-mono text-xs text-stone-dark">Carregando editorias...</p>
          </div>
        ) : categories.length === 0 ? (
          <div className="py-20 text-center text-stone-dark space-y-2">
            <FolderTree className="w-10 h-10 mx-auto text-stone-dark/30" />
            <p className="text-sm">Nenhuma categoria cadastrada ainda.</p>
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#2A2A2A] bg-[#141414] font-mono text-[10px] text-stone-dark uppercase tracking-wider">
                <th className="py-3.5 px-4 w-12 text-center">Ordem</th>
                <th className="py-3.5 px-4">Nome da Editoria</th>
                <th className="py-3.5 px-4">Slug URL</th>
                <th className="py-3.5 px-4">Descrição</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#222222] text-xs font-sans">
              {categories.map((cat) => (
                <tr key={cat.id} className="hover:bg-[#1C1C1C] transition-colors">
                  <td className="py-3.5 px-4 text-center font-mono text-stone-dark">
                    {cat.sort_order}
                  </td>
                  <td className="py-3.5 px-4 font-serif font-bold text-white">
                    {cat.name}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-[11px] text-stone-dark">
                    /categoria/{cat.slug}
                  </td>
                  <td className="py-3.5 px-4 text-stone-dark max-w-xs truncate">
                    {cat.description || "—"}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    {cat.active ? (
                      <span className="px-2 py-0.5 rounded text-[9px] font-mono bg-emerald-950/80 text-emerald-300 border border-emerald-800/60">
                        ATIVA
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[9px] font-mono bg-stone-dark/30 text-stone-dark">
                        INATIVA
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleOpenEdit(cat)}
                        className="p-1.5 text-stone-dark hover:text-white hover:bg-[#252525] rounded transition-colors"
                        title="Editar"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(cat)}
                        className="p-1.5 text-stone-dark hover:text-red-400 hover:bg-red-950/40 rounded transition-colors"
                        title="Excluir"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal de Criação/Edição */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#171717] border border-[#333333] rounded-lg w-full max-w-md p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-[#2A2A2A]">
              <h3 className="font-serif text-lg font-bold text-white">
                {editingCat ? "Editar Categoria" : "Nova Categoria"}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-stone-dark hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block font-mono text-xs text-stone-dark uppercase mb-1.5">
                  Nome da Categoria *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={handleNameChange}
                  required
                  placeholder="Ex: Arte Sacra & Barroco"
                  className="w-full p-2.5 bg-[#101010] border border-[#333] rounded text-xs text-white focus:outline-none focus:border-gold"
                />
              </div>

              <div>
                <label className="block font-mono text-xs text-stone-dark uppercase mb-1.5">
                  Slug
                </label>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className="w-full p-2.5 bg-[#101010] border border-[#333] rounded text-xs font-mono text-stone focus:outline-none focus:border-gold"
                />
              </div>

              <div>
                <label className="block font-mono text-xs text-stone-dark uppercase mb-1.5">
                  Descrição
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  placeholder="Breve descrição da editoria..."
                  className="w-full p-2.5 bg-[#101010] border border-[#333] rounded text-xs text-stone focus:outline-none focus:border-gold"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-mono text-xs text-stone-dark uppercase mb-1.5">
                    Ordem de Exibição
                  </label>
                  <input
                    type="number"
                    value={sortOrder}
                    onChange={(e) => setSortOrder(Number(e.target.value))}
                    className="w-full p-2 bg-[#101010] border border-[#333] rounded text-xs text-stone focus:outline-none"
                  />
                </div>

                <div className="flex flex-col justify-center pt-5">
                  <label className="flex items-center gap-2 cursor-pointer text-xs text-stone">
                    <input
                      type="checkbox"
                      checked={active}
                      onChange={(e) => setActive(e.target.checked)}
                      className="w-4 h-4 accent-gold"
                    />
                    <span>Ativa no portal</span>
                  </label>
                </div>
              </div>

              <div className="pt-4 border-t border-[#2A2A2A] flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-[#222] hover:bg-[#2C2C2C] text-stone text-xs font-mono rounded"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 bg-gold hover:bg-gold-light text-night font-bold text-xs font-mono uppercase rounded transition-colors"
                >
                  {saving ? "Salvando..." : "Salvar Categoria"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
