"use client";

import React, { useEffect, useState } from "react";
import { AdminEditorialService, DatabaseMuseum, DatabaseMedia } from "@/lib/services/adminEditorialService";
import { MediaPickerModal } from "@/components/admin/MediaPickerModal";
import {
  Landmark,
  Plus,
  Edit2,
  Trash2,
  Image as ImageIcon,
  ExternalLink,
  MapPin,
  X,
  Loader2,
} from "lucide-react";

export default function AdminMuseumsPage() {
  const [museums, setMuseums] = useState<DatabaseMuseum[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);
  const [editingMuseum, setEditingMuseum] = useState<DatabaseMuseum | null>(null);

  // Campos do formulário
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [address, setAddress] = useState("");
  const [website, setWebsite] = useState("");
  const [selectedImage, setSelectedImage] = useState<DatabaseMedia | null>(null);
  const [active, setActive] = useState(true);

  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(
    null
  );

  useEffect(() => {
    loadMuseums();
  }, []);

  const loadMuseums = async () => {
    setLoading(true);
    try {
      const data = await AdminEditorialService.getMuseums();
      setMuseums(data);
    } catch (err) {
      setFeedback({ type: "error", text: "Erro ao carregar museus." });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setEditingMuseum(null);
    setName("");
    setSlug("");
    setDescription("");
    setAddress("");
    setWebsite("");
    setSelectedImage(null);
    setActive(true);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (mus: DatabaseMuseum) => {
    setEditingMuseum(mus);
    setName(mus.name);
    setSlug(mus.slug);
    setDescription(mus.description || "");
    setAddress(mus.address || "");
    setWebsite(mus.website || "");
    setSelectedImage(mus.featured_image || null);
    setActive(mus.active);
    setIsModalOpen(true);
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setName(val);
    if (!editingMuseum) {
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
      address: address.trim() || null,
      website: website.trim() || null,
      featured_image_id: selectedImage?.id || null,
      active,
    };

    try {
      if (editingMuseum) {
        const updated = await AdminEditorialService.updateMuseum(editingMuseum.id, payload);
        setMuseums((prev) => prev.map((m) => (m.id === updated.id ? updated : m)));
        setFeedback({ type: "success", text: "Museu atualizado com sucesso." });
      } else {
        const created = await AdminEditorialService.createMuseum(payload as any);
        setMuseums((prev) => [...prev, created]);
        setFeedback({ type: "success", text: "Museu cadastrado com sucesso." });
      }
      setIsModalOpen(false);
    } catch (err: any) {
      setFeedback({ type: "error", text: err.message || "Erro ao salvar museu." });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (mus: DatabaseMuseum) => {
    if (!confirm(`Deseja realmente excluir a instituição "${mus.name}"?`)) return;

    try {
      await AdminEditorialService.deleteMuseum(mus.id);
      setMuseums((prev) => prev.filter((m) => m.id !== mus.id));
      setFeedback({ type: "success", text: "Museu excluído com sucesso." });
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
            Museus & Instituições Parceiras
          </h1>
          <p className="text-xs sm:text-sm text-stone-dark mt-1 font-sans">
            Cadastro das instituições do Sistema de Museus de Ouro Preto (SiMOP).
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-gold hover:bg-gold-light text-night font-bold text-xs uppercase tracking-wider rounded transition-all shadow-md self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Cadastrar Museu</span>
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

      {/* Grid de Museus */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {loading ? (
          <div className="col-span-full py-24 text-center">
            <Loader2 className="w-8 h-8 text-gold animate-spin mx-auto mb-2" />
            <p className="font-mono text-xs text-stone-dark">Carregando museus parceiros...</p>
          </div>
        ) : museums.length === 0 ? (
          <div className="col-span-full py-24 text-center text-stone-dark space-y-2">
            <Landmark className="w-10 h-10 mx-auto text-stone-dark/30" />
            <p className="text-sm">Nenhum museu cadastrado ainda.</p>
          </div>
        ) : (
          museums.map((mus) => (
            <div
              key={mus.id}
              className="bg-[#171717] border border-[#282828] hover:border-gold/50 rounded overflow-hidden flex flex-col justify-between transition-colors group"
            >
              <div className="p-5 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <span className="font-mono text-[10px] text-gold uppercase bg-gold/10 px-2 py-0.5 border border-gold/20 rounded">
                    SiMOP Ouro Preto
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(mus)}
                      className="p-1 text-stone-dark hover:text-white rounded"
                      title="Editar"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(mus)}
                      className="p-1 text-stone-dark hover:text-red-400 rounded"
                      title="Excluir"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <h3 className="font-serif font-bold text-white text-base group-hover:text-gold transition-colors">
                  {mus.name}
                </h3>

                {mus.description && (
                  <p className="text-xs text-stone-dark line-clamp-2 font-sans">
                    {mus.description}
                  </p>
                )}

                {mus.address && (
                  <div className="flex items-center gap-1.5 text-[11px] font-mono text-stone-dark">
                    <MapPin className="w-3 h-3 text-gold shrink-0" />
                    <span className="truncate">{mus.address}</span>
                  </div>
                )}
              </div>

              <div className="px-5 py-3 bg-[#131313] border-t border-[#222222] flex items-center justify-between text-xs font-mono">
                <span className="text-stone-dark">/{mus.slug}</span>
                {mus.website && (
                  <a
                    href={mus.website}
                    target="_blank"
                    rel="noreferrer"
                    className="text-gold hover:underline flex items-center gap-1 text-[11px]"
                  >
                    <span>Website</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal de Criação / Edição de Museu */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#171717] border border-[#333333] rounded-lg w-full max-w-lg p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#2A2A2A]">
              <h3 className="font-serif text-lg font-bold text-white">
                {editingMuseum ? "Editar Museu" : "Cadastrar Museu Parceiro"}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-stone-dark hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block font-mono text-xs text-stone-dark uppercase mb-1.5">
                  Nome da Instituição *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={handleNameChange}
                  required
                  placeholder="Ex: Museu Casa dos Contos"
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
                  Endereço em Ouro Preto
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Ex: Rua São José, 12 - Centro Histórico"
                  className="w-full p-2.5 bg-[#101010] border border-[#333] rounded text-xs text-stone focus:outline-none focus:border-gold"
                />
              </div>

              <div>
                <label className="block font-mono text-xs text-stone-dark uppercase mb-1.5">
                  Site Oficial / Link
                </label>
                <input
                  type="url"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder="https://..."
                  className="w-full p-2.5 bg-[#101010] border border-[#333] rounded text-xs text-stone focus:outline-none focus:border-gold"
                />
              </div>

              <div>
                <label className="block font-mono text-xs text-stone-dark uppercase mb-1.5">
                  Descrição Histórica / Acervo
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  placeholder="Apresentação do acervo e relevância cultural..."
                  className="w-full p-2.5 bg-[#101010] border border-[#333] rounded text-xs text-stone focus:outline-none focus:border-gold"
                />
              </div>

              {/* Imagem do Museu */}
              <div>
                <label className="block font-mono text-xs text-stone-dark uppercase mb-1.5">
                  Foto Fachada / Destaque
                </label>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setIsMediaModalOpen(true)}
                    className="px-3 py-2 bg-[#222] hover:bg-[#2A2A2A] border border-[#333] rounded text-xs font-mono text-stone flex items-center gap-2"
                  >
                    <ImageIcon className="w-3.5 h-3.5 text-gold" />
                    <span>{selectedImage ? "Trocar Imagem" : "Escolher do Acervo"}</span>
                  </button>
                  {selectedImage && (
                    <span className="text-[11px] font-mono text-stone-dark truncate max-w-[200px]">
                      {selectedImage.alt_text || selectedImage.filename}
                    </span>
                  )}
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
                  {saving ? "Salvando..." : "Salvar Museu"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Mídia */}
      <MediaPickerModal
        isOpen={isMediaModalOpen}
        onClose={() => setIsMediaModalOpen(false)}
        onSelect={(media) => setSelectedImage(media)}
        selectedMediaId={selectedImage?.id}
      />
    </div>
  );
}
