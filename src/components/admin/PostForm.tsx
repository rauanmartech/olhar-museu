"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  AdminEditorialService,
  DatabaseCategory,
  DatabaseMuseum,
  DatabaseTag,
  DatabaseMedia,
  DatabasePost,
} from "@/lib/services/adminEditorialService";
import { MediaPickerModal } from "./MediaPickerModal";
import {
  Save,
  ArrowLeft,
  Image as ImageIcon,
  Sparkles,
  Layers,
  Calendar,
  Clock,
  Globe,
  Tag as TagIcon,
  Plus,
  Trash2,
  Loader2,
  AlertCircle,
  CheckCircle2,
  PlusCircle,
  Eye,
} from "lucide-react";

interface PostFormProps {
  initialData?: DatabasePost | null;
  isEditing?: boolean;
}

export function PostForm({ initialData, isEditing = false }: PostFormProps) {
  const router = useRouter();

  // Entidades carregadas
  const [categories, setCategories] = useState<DatabaseCategory[]>([]);
  const [museums, setMuseums] = useState<DatabaseMuseum[]>([]);
  const [availableTags, setAvailableTags] = useState<DatabaseTag[]>([]);

  // Campos do Formulário
  const [title, setTitle] = useState(initialData?.title || "");
  const [subtitle, setSubtitle] = useState(initialData?.subtitle || "");
  const [slug, setSlug] = useState(initialData?.slug || "");
  const [excerpt, setExcerpt] = useState(initialData?.excerpt || "");
  const [status, setStatus] = useState<string>(initialData?.status || "DRAFT");
  const [categoryId, setCategoryId] = useState<string>(initialData?.category_id || "");
  const [museumId, setMuseumId] = useState<string>(initialData?.museum_id || "");
  const [selectedMedia, setSelectedMedia] = useState<DatabaseMedia | null>(
    (initialData?.featured_image as any) || null
  );
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>(
    initialData?.tags?.map((t) => t.id) || []
  );

  // Parâmetros Editoriais & Destaques
  const [readingTime, setReadingTime] = useState<number>(initialData?.reading_time_minutes || 3);
  const [featured, setFeatured] = useState<boolean>(initialData?.featured || false);
  const [featuredPosition, setFeaturedPosition] = useState<number | null>(
    initialData?.featured_position || null
  );

  // SEO & Metadados
  const [seoTitle, setSeoTitle] = useState(initialData?.seo_title || "");
  const [seoDescription, setSeoDescription] = useState(initialData?.seo_description || "");
  const [canonicalUrl, setCanonicalUrl] = useState(initialData?.canonical_url || "");
  const [publishedAt, setPublishedAt] = useState(
    initialData?.published_at ? initialData.published_at.slice(0, 16) : ""
  );

  // Blocos de Conteúdo Editorial
  const [contentBlocks, setContentBlocks] = useState<any[]>(() => {
    if (!initialData?.content) {
      return [{ type: "paragraph", content: "" }];
    }

    // Se já estiver no formato { blocks: [...] }
    if (Array.isArray(initialData.content.blocks) && initialData.content.blocks.length > 0) {
      return initialData.content.blocks;
    }

    // Se estiver no formato TipTap/ProseMirror { type: "doc", content: [...] }
    if (initialData.content.type === "doc" && Array.isArray(initialData.content.content)) {
      const extractedBlocks = initialData.content.content
        .map((node: any) => {
          const text = node.content?.map((c: any) => c.text).join("") || "";
          if (node.type === "heading") {
            return { type: "heading", content: text };
          }
          if (node.type === "blockquote") {
            return { type: "quote", content: text };
          }
          return { type: "paragraph", content: text };
        })
        .filter((block: any) => Boolean(block.content));

      if (extractedBlocks.length > 0) {
        return extractedBlocks;
      }
    }

    // Se for string simples
    if (typeof initialData.content === "string" && initialData.content.trim()) {
      return [{ type: "paragraph", content: initialData.content }];
    }

    return [{ type: "paragraph", content: "" }];
  });

  // Modais e Estados Auxiliares
  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);
  const [newTagName, setNewTagName] = useState("");
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const loadDependencies = React.useCallback(async () => {
    try {
      const [cats, mus, tags] = await Promise.all([
        AdminEditorialService.getCategories(),
        AdminEditorialService.getMuseums(),
        AdminEditorialService.getTags(),
      ]);
      setCategories(cats);
      setMuseums(mus);
      setAvailableTags(tags);

      // Se categoria não estiver setada, selecionar a primeira
      if (!categoryId && cats.length > 0) {
        setCategoryId(cats[0].id);
      }
    } catch {
      // Silencioso
    }
  }, [categoryId]);

  useEffect(() => {
    loadDependencies();
  }, [loadDependencies]);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setTitle(val);
    if (!isEditing || !slug) {
      setSlug(AdminEditorialService.generateSlug(val));
    }
  };

  const handleCreateTag = async () => {
    if (!newTagName.trim()) return;
    try {
      const slug = AdminEditorialService.generateSlug(newTagName);
      const tag = await AdminEditorialService.createTag({ name: newTagName.trim(), slug });
      setAvailableTags((prev) => [...prev, tag]);
      setSelectedTagIds((prev) => [...prev, tag.id]);
      setNewTagName("");
    } catch (err: any) {
      alert("Erro ao criar tag: " + err.message);
    }
  };

  const toggleTag = (id: string) => {
    setSelectedTagIds((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
    );
  };

  // Gerenciamento de Blocos de Conteúdo
  const addBlock = (type: "paragraph" | "heading" | "quote") => {
    setContentBlocks((prev) => [...prev, { type, content: "" }]);
  };

  const updateBlockContent = (index: number, content: string) => {
    setContentBlocks((prev) =>
      prev.map((block, i) => (i === index ? { ...block, content } : block))
    );
  };

  const removeBlock = (index: number) => {
    setContentBlocks((prev) => prev.filter((_, i) => i !== index));
  };

  // Submit Form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMsg("O título da publicação é obrigatório.");
      return;
    }
    if (!categoryId) {
      setErrorMsg("Por favor, selecione uma categoria.");
      return;
    }

    setSaving(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    const postPayload = {
      title: title.trim(),
      subtitle: subtitle.trim() || null,
      slug: slug.trim() || AdminEditorialService.generateSlug(title),
      excerpt: excerpt.trim() || null,
      content: { blocks: contentBlocks },
      status,
      category_id: categoryId,
      museum_id: museumId || null,
      featured_image_id: selectedMedia?.id || null,
      reading_time_minutes: Number(readingTime) || 3,
      featured,
      featured_position: featured ? Number(featuredPosition) || 1 : null,
      seo_title: seoTitle.trim() || null,
      seo_description: seoDescription.trim() || null,
      canonical_url: canonicalUrl.trim() || null,
      published_at: publishedAt ? new Date(publishedAt).toISOString() : null,
      tag_ids: selectedTagIds,
    };

    try {
      if (isEditing && initialData) {
        await AdminEditorialService.updatePost(initialData.id, postPayload);
        setSuccessMsg("Matéria atualizada com sucesso!");
      } else {
        const created = await AdminEditorialService.createPost(postPayload as any);
        setSuccessMsg("Matéria criada com sucesso!");
        setTimeout(() => {
          router.push(`/admin/noticias/${created.id}`);
        }, 1200);
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Erro ao salvar publicação.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Barra de Topo do Editor */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-[#262626] sticky top-0 bg-[#0F0F0F] z-20 pt-2">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.push("/admin/noticias")}
            className="p-2 text-stone-dark hover:text-white bg-[#1A1A1A] hover:bg-[#252525] rounded transition-colors"
            title="Voltar para notícias"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="font-serif text-xl sm:text-2xl font-bold text-white tracking-tight">
              {isEditing ? "Editar Matéria Editorial" : "Nova Matéria Editorial"}
            </h1>
            <p className="text-[11px] font-mono text-stone-dark">
              {isEditing ? `ID: ${initialData?.id}` : "Criando publicação no schema editorial"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {isEditing && slug && (
            <a
              href={`/noticias/${slug}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-[#222222] hover:bg-[#2A2A2A] text-stone text-xs font-mono rounded transition-colors"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Ver no Site</span>
            </a>
          )}

          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-gold hover:bg-gold-light text-night font-bold text-xs uppercase tracking-wider rounded transition-all shadow-md hover:shadow-gold/20 disabled:opacity-50"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Salvando...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>{isEditing ? "Salvar Alterações" : "Publicar / Salvar"}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Alertas */}
      {errorMsg && (
        <div className="p-4 bg-red-950/70 border border-red-800 rounded text-red-200 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}
      {successMsg && (
        <div className="p-4 bg-emerald-950/70 border border-emerald-800 rounded text-emerald-200 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Grid Principal do Formulário: 2 Colunas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Coluna 1 e 2: Conteúdo da Matéria */}
        <div className="lg:col-span-2 space-y-6">
          {/* Título & Subtítulo */}
          <div className="bg-[#171717] border border-[#282828] rounded p-6 space-y-4">
            <div>
              <label className="block font-mono text-xs text-stone-dark uppercase tracking-wider mb-2 font-medium">
                Título Principal da Notícia *
              </label>
              <input
                type="text"
                value={title}
                onChange={handleTitleChange}
                placeholder="Ex: Museu da Inconfidência abre nova exposição sobre acervo barroco"
                required
                className="w-full p-3 bg-[#101010] border border-[#333333] rounded text-base sm:text-lg font-serif font-bold text-white focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold placeholder:text-stone-dark/50"
              />
            </div>

            <div>
              <label className="block font-mono text-xs text-stone-dark uppercase tracking-wider mb-2 font-medium">
                Subtítulo / Linha Fina (Opcional)
              </label>
              <input
                type="text"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                placeholder="Ex: Mostra inédita reúne 40 peças sacras do século XVIII restauradas"
                className="w-full p-2.5 bg-[#101010] border border-[#333333] rounded text-xs sm:text-sm font-sans text-stone focus:outline-none focus:border-gold placeholder:text-stone-dark/50"
              />
            </div>

            <div>
              <label className="block font-mono text-xs text-stone-dark uppercase tracking-wider mb-2 font-medium">
                Slug (URL Amigável)
              </label>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs text-stone-dark bg-[#121212] px-3 py-2 border border-[#2A2A2A] rounded">
                  /noticias/
                </span>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className="flex-1 p-2 bg-[#101010] border border-[#333333] rounded text-xs font-mono text-stone focus:outline-none focus:border-gold"
                />
              </div>
            </div>

            <div>
              <label className="block font-mono text-xs text-stone-dark uppercase tracking-wider mb-2 font-medium">
                Resumo / Lead Jornalístico
              </label>
              <textarea
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                rows={3}
                placeholder="Breve síntese dos pontos essenciais da matéria para a listagem e redes sociais..."
                className="w-full p-2.5 bg-[#101010] border border-[#333333] rounded text-xs font-sans text-stone focus:outline-none focus:border-gold placeholder:text-stone-dark/50"
              />
            </div>
          </div>

          {/* Imagem de Destaque da Matéria */}
          <div className="bg-[#171717] border border-[#282828] rounded p-6 space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs text-stone-dark uppercase tracking-wider font-medium">
                Imagem de Capa / Destaque
              </span>
              <button
                type="button"
                onClick={() => setIsMediaModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gold/10 hover:bg-gold/20 text-gold border border-gold/30 rounded text-xs font-mono transition-colors"
              >
                <ImageIcon className="w-3.5 h-3.5" />
                <span>{selectedMedia ? "Trocar Imagem" : "Escolher do Acervo"}</span>
              </button>
            </div>

            {selectedMedia && selectedMedia.public_url ? (
              <div className="relative aspect-video bg-[#101010] rounded border border-[#333] overflow-hidden group">
                <img
                  src={selectedMedia.public_url}
                  alt={selectedMedia.alt_text || "Imagem selecionada"}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => setIsMediaModalOpen(true)}
                    className="px-3 py-1.5 bg-gold text-night text-xs font-bold rounded"
                  >
                    Alterar
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedMedia(null)}
                    className="px-3 py-1.5 bg-red-900 text-white text-xs font-bold rounded"
                  >
                    Remover
                  </button>
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-2 bg-black/80 text-[11px] font-mono text-stone truncate">
                  {selectedMedia.alt_text || selectedMedia.filename}
                </div>
              </div>
            ) : (
              <div
                onClick={() => setIsMediaModalOpen(true)}
                className="border-2 border-dashed border-[#333333] hover:border-gold/60 rounded-lg p-8 text-center cursor-pointer transition-colors bg-[#121212] space-y-2"
              >
                <ImageIcon className="w-8 h-8 mx-auto text-stone-dark" />
                <p className="text-xs text-stone font-medium">
                  Nenhuma imagem vinculada. Clique para selecionar ou subir uma nova foto.
                </p>
              </div>
            )}
          </div>

          {/* Blocos de Conteúdo Jornalístico */}
          <div className="bg-[#171717] border border-[#282828] rounded p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#252525]">
              <span className="font-mono text-xs text-gold uppercase tracking-wider font-bold">
                Corpo da Matéria (Blocos de Conteúdo)
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => addBlock("paragraph")}
                  className="px-2.5 py-1 bg-[#222] hover:bg-[#2A2A2A] text-stone text-xs font-mono rounded border border-[#333]"
                >
                  + Parágrafo
                </button>
                <button
                  type="button"
                  onClick={() => addBlock("heading")}
                  className="px-2.5 py-1 bg-[#222] hover:bg-[#2A2A2A] text-stone text-xs font-mono rounded border border-[#333]"
                >
                  + Subtítulo (H2)
                </button>
                <button
                  type="button"
                  onClick={() => addBlock("quote")}
                  className="px-2.5 py-1 bg-[#222] hover:bg-[#2A2A2A] text-stone text-xs font-mono rounded border border-[#333]"
                >
                  + Citação
                </button>
              </div>
            </div>

            <div className="space-y-4">
              {contentBlocks.map((block, idx) => (
                <div
                  key={idx}
                  className="p-4 bg-[#121212] border border-[#2B2B2B] rounded space-y-2 relative group"
                >
                  <div className="flex items-center justify-between font-mono text-[10px] text-stone-dark uppercase">
                    <span>
                      Bloco {idx + 1} · {block.type === "heading" ? "Intertítulo" : block.type === "quote" ? "Aspas / Citação" : "Parágrafo"}
                    </span>
                    {contentBlocks.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeBlock(idx)}
                        className="text-red-400 hover:text-red-300 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {block.type === "heading" ? (
                    <input
                      type="text"
                      value={block.content || ""}
                      onChange={(e) => updateBlockContent(idx, e.target.value)}
                      placeholder="Intertítulo da seção..."
                      className="w-full p-2 bg-[#171717] border border-[#333] rounded text-sm font-serif font-bold text-white focus:outline-none focus:border-gold"
                    />
                  ) : block.type === "quote" ? (
                    <textarea
                      value={block.content || ""}
                      onChange={(e) => updateBlockContent(idx, e.target.value)}
                      rows={2}
                      placeholder="Citação ou declaração relevante..."
                      className="w-full p-2 bg-[#171717] border border-gold/40 rounded text-xs font-serif italic text-gold-light focus:outline-none"
                    />
                  ) : (
                    <textarea
                      value={block.content || ""}
                      onChange={(e) => updateBlockContent(idx, e.target.value)}
                      rows={4}
                      placeholder="Digite o parágrafo da notícia..."
                      className="w-full p-2.5 bg-[#171717] border border-[#333] rounded text-xs font-sans text-stone leading-relaxed focus:outline-none focus:border-gold"
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Coluna 3: Painel Lateral de Configurações e Publicação */}
        <div className="space-y-6">
          {/* Status & Publicação */}
          <div className="bg-[#171717] border border-[#282828] rounded p-5 space-y-4">
            <h3 className="font-serif text-sm font-bold text-white pb-2 border-b border-[#252525]">
              Estado da Publicação
            </h3>

            <div>
              <label className="block font-mono text-xs text-stone-dark uppercase tracking-wider mb-2">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full p-2.5 bg-[#101010] border border-[#333333] rounded text-xs font-mono text-white focus:outline-none focus:border-gold"
              >
                <option value="DRAFT">Rascunho (DRAFT)</option>
                <option value="REVIEW">Em Revisão (REVIEW)</option>
                <option value="SCHEDULED">Agendado (SCHEDULED)</option>
                <option value="PUBLISHED">Publicado no Ar (PUBLISHED)</option>
                <option value="ARCHIVED">Arquivado (ARCHIVED)</option>
              </select>
            </div>

            <div>
              <label className="block font-mono text-xs text-stone-dark uppercase tracking-wider mb-2">
                Data / Hora de Publicação
              </label>
              <input
                type="datetime-local"
                value={publishedAt}
                onChange={(e) => setPublishedAt(e.target.value)}
                className="w-full p-2 bg-[#101010] border border-[#333333] rounded text-xs font-mono text-stone focus:outline-none focus:border-gold"
              />
            </div>

            <div>
              <label className="block font-mono text-xs text-stone-dark uppercase tracking-wider mb-2">
                Tempo de Leitura (minutos)
              </label>
              <input
                type="number"
                min={1}
                max={60}
                value={readingTime}
                onChange={(e) => setReadingTime(Number(e.target.value))}
                className="w-full p-2 bg-[#101010] border border-[#333333] rounded text-xs font-mono text-stone focus:outline-none focus:border-gold"
              />
            </div>
          </div>

          {/* Destaque Editorial */}
          <div className="bg-[#171717] border border-gold/30 rounded p-5 space-y-4">
            <h3 className="font-serif text-sm font-bold text-gold flex items-center gap-2 pb-2 border-b border-gold/20">
              <Sparkles className="w-4 h-4" />
              <span>Destaque na Página Inicial</span>
            </h3>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="featuredToggle"
                checked={featured}
                onChange={(e) => setFeatured(e.target.checked)}
                className="w-4 h-4 accent-gold cursor-pointer"
              />
              <label htmlFor="featuredToggle" className="text-xs font-sans text-stone cursor-pointer">
                Exibir na grade principal de destaques
              </label>
            </div>

            {featured && (
              <div>
                <label className="block font-mono text-[11px] text-stone-dark uppercase tracking-wider mb-1.5">
                  Posição de Destaque
                </label>
                <select
                  value={featuredPosition || 1}
                  onChange={(e) => setFeaturedPosition(Number(e.target.value))}
                  className="w-full p-2 bg-[#101010] border border-gold/50 rounded text-xs font-mono text-gold focus:outline-none"
                >
                  <option value={1}>Posição 1 — Super Manchete (Topo Principal)</option>
                  <option value={2}>Posição 2 — Destaque Secundário A</option>
                  <option value={3}>Posição 3 — Destaque Secundário B</option>
                  <option value={4}>Posição 4 — Destaque Secundário C</option>
                </select>
              </div>
            )}
          </div>

          {/* Categorias & Museus */}
          <div className="bg-[#171717] border border-[#282828] rounded p-5 space-y-4">
            <h3 className="font-serif text-sm font-bold text-white pb-2 border-b border-[#252525]">
              Taxonomia Editorial
            </h3>

            <div>
              <label className="block font-mono text-xs text-stone-dark uppercase tracking-wider mb-2">
                Editoria / Categoria *
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                required
                className="w-full p-2.5 bg-[#101010] border border-[#333333] rounded text-xs text-white focus:outline-none focus:border-gold"
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-mono text-xs text-stone-dark uppercase tracking-wider mb-2">
                Museu Vinculado (Opcional)
              </label>
              <select
                value={museumId}
                onChange={(e) => setMuseumId(e.target.value)}
                className="w-full p-2.5 bg-[#101010] border border-[#333333] rounded text-xs text-stone focus:outline-none focus:border-gold"
              >
                <option value="">Nenhum museu específico</option>
                {museums.map((mus) => (
                  <option key={mus.id} value={mus.id}>
                    {mus.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Tags */}
            <div>
              <label className="block font-mono text-xs text-stone-dark uppercase tracking-wider mb-2">
                Tags
              </label>
              <div className="flex flex-wrap gap-1.5 mb-2 max-h-32 overflow-y-auto p-1">
                {availableTags.map((tag) => {
                  const isSelected = selectedTagIds.includes(tag.id);
                  return (
                    <button
                      type="button"
                      key={tag.id}
                      onClick={() => toggleTag(tag.id)}
                      className={`px-2 py-1 rounded text-[11px] font-mono transition-colors ${
                        isSelected
                          ? "bg-gold text-night font-bold"
                          : "bg-[#202020] text-stone hover:text-white"
                      }`}
                    >
                      #{tag.name}
                    </button>
                  );
                })}
              </div>

              {/* Criar nova tag rápida */}
              <div className="flex gap-1.5">
                <input
                  type="text"
                  placeholder="Nova tag..."
                  value={newTagName}
                  onChange={(e) => setNewTagName(e.target.value)}
                  className="flex-1 p-1.5 bg-[#101010] border border-[#333] rounded text-xs text-white"
                />
                <button
                  type="button"
                  onClick={handleCreateTag}
                  className="px-2.5 py-1.5 bg-[#252525] hover:bg-gold hover:text-night text-stone rounded text-xs font-mono transition-colors"
                >
                  + Add
                </button>
              </div>
            </div>
          </div>

          {/* Otimização de Busca & SEO */}
          <div className="bg-[#171717] border border-[#282828] rounded p-5 space-y-4">
            <h3 className="font-serif text-sm font-bold text-white pb-2 border-b border-[#252525] flex items-center gap-2">
              <Globe className="w-4 h-4 text-stone-dark" />
              <span>SEO & Indexação</span>
            </h3>

            <div>
              <label className="block font-mono text-[11px] text-stone-dark uppercase mb-1">
                Título SEO (Meta Title)
              </label>
              <input
                type="text"
                value={seoTitle}
                onChange={(e) => setSeoTitle(e.target.value)}
                placeholder="Título otimizado para o Google..."
                className="w-full p-2 bg-[#101010] border border-[#333] rounded text-xs text-stone"
              />
            </div>

            <div>
              <label className="block font-mono text-[11px] text-stone-dark uppercase mb-1">
                Descrição SEO (Meta Description)
              </label>
              <textarea
                value={seoDescription}
                onChange={(e) => setSeoDescription(e.target.value)}
                rows={2}
                placeholder="Descrição de 150 a 160 caracteres..."
                className="w-full p-2 bg-[#101010] border border-[#333] rounded text-xs text-stone"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Mídia */}
      <MediaPickerModal
        isOpen={isMediaModalOpen}
        onClose={() => setIsMediaModalOpen(false)}
        onSelect={(media) => setSelectedMedia(media)}
        selectedMediaId={selectedMedia?.id}
      />
    </form>
  );
}
