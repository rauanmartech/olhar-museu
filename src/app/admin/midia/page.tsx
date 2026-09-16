"use client";

import React, { useEffect, useState } from "react";
import { AdminEditorialService, DatabaseMedia } from "@/lib/services/adminEditorialService";
import {
  Image as ImageIcon,
  Upload,
  Search,
  Trash2,
  Copy,
  Check,
  Loader2,
  ExternalLink,
  Info,
  X,
} from "lucide-react";

export default function AdminMediaPage() {
  const [mediaList, setMediaList] = useState<DatabaseMedia[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedMedia, setSelectedMedia] = useState<DatabaseMedia | null>(null);
  const [altText, setAltText] = useState("");
  const [caption, setCaption] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    loadMedia();
  }, []);

  const loadMedia = async () => {
    setLoading(true);
    try {
      const data = await AdminEditorialService.getMediaList();
      setMediaList(data);
    } catch {
      setErrorMsg("Aguardando configuração do bucket de mídia no Supabase.");
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const newMedia = await AdminEditorialService.uploadMedia(file, {
        alt_text: altText,
        caption: caption,
      });

      setMediaList((prev) => [newMedia, ...prev]);
      setSuccessMsg("Mídia enviada e catalogada com sucesso!");
      setAltText("");
      setCaption("");
      setSelectedMedia(newMedia);
    } catch (err: any) {
      setErrorMsg(err.message || "Erro no upload da mídia.");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (media: DatabaseMedia) => {
    if (!confirm(`Tem certeza que deseja excluir "${media.original_name || media.filename}"?`)) {
      return;
    }

    try {
      await AdminEditorialService.deleteMedia(media.id, media.path, media.bucket);
      setMediaList((prev) => prev.filter((m) => m.id !== media.id));
      if (selectedMedia?.id === media.id) setSelectedMedia(null);
      setSuccessMsg("Mídia excluída com sucesso.");
    } catch (err: any) {
      setErrorMsg("Erro ao excluir arquivo de mídia: " + err.message);
    }
  };

  const copyUrlToClipboard = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filtered = mediaList.filter(
    (m) =>
      (m.filename || "").toLowerCase().includes(search.toLowerCase()) ||
      (m.original_name || "").toLowerCase().includes(search.toLowerCase()) ||
      (m.alt_text || "").toLowerCase().includes(search.toLowerCase()) ||
      (m.caption || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Cabeçalho da Página */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-[#262626]">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Acervo e Biblioteca de Mídia
          </h1>
          <p className="text-xs sm:text-sm text-stone-dark mt-1 font-sans">
            Armazenamento de imagens históricas, registros fotográficos e fotos de exposições.
          </p>
        </div>

        <div>
          <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2.5 bg-gold hover:bg-gold-light text-night font-bold text-xs uppercase tracking-wider rounded transition-all shadow-md hover:shadow-gold/20">
            {uploading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Enviando...</span>
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                <span>Upload de Imagem</span>
              </>
            )}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileUpload}
              disabled={uploading}
            />
          </label>
        </div>
      </div>

      {/* Alertas */}
      {errorMsg && (
        <div className="p-3.5 bg-red-950/70 border border-red-800 rounded text-red-200 text-xs">
          {errorMsg}
        </div>
      )}
      {successMsg && (
        <div className="p-3.5 bg-emerald-950/70 border border-emerald-800 rounded text-emerald-200 text-xs">
          {successMsg}
        </div>
      )}

      {/* Barra de Filtro e Busca */}
      <div className="flex items-center justify-between gap-4 bg-[#171717] border border-[#282828] p-3 rounded">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-stone-dark absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por nome do arquivo ou legenda..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-[#101010] border border-[#333333] rounded text-xs text-white placeholder:text-stone-dark focus:outline-none focus:border-gold"
          />
        </div>

        <span className="font-mono text-xs text-stone-dark">
          {filtered.length} {filtered.length === 1 ? "arquivo" : "arquivos"}
        </span>
      </div>

      {/* Layout de 2 Colunas: Grade de Mídia + Detalhes Selecionados */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Grade de Mídia */}
        <div className="lg:col-span-2 bg-[#171717] border border-[#282828] rounded p-5">
          {loading ? (
            <div className="py-24 text-center">
              <Loader2 className="w-8 h-8 text-gold animate-spin mx-auto mb-2" />
              <p className="font-mono text-xs text-stone-dark">Carregando acervo de imagens...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-24 text-center space-y-3">
              <ImageIcon className="w-12 h-12 mx-auto text-stone-dark/30" />
              <p className="text-sm font-sans text-stone-dark">Nenhuma mídia encontrada no acervo.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {filtered.map((item) => {
                const isSelected = selectedMedia?.id === item.id;
                return (
                  <div
                    key={item.id}
                    onClick={() => setSelectedMedia(item)}
                    className={`group relative aspect-square bg-[#121212] rounded border overflow-hidden cursor-pointer transition-all hover:border-gold ${
                      isSelected ? "border-gold ring-2 ring-gold" : "border-[#2D2D2D]"
                    }`}
                  >
                    {item.public_url ? (
                      <img
                        src={item.public_url}
                        alt={item.alt_text || item.filename}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-stone-dark">
                        <ImageIcon className="w-8 h-8 opacity-40" />
                      </div>
                    )}

                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-2">
                      <span className="text-[10px] font-mono text-white truncate">
                        {item.original_name || item.filename}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Painel Lateral de Informações da Mídia Selecionada */}
        <div className="bg-[#171717] border border-[#282828] rounded p-5 space-y-5 h-fit">
          <div className="flex items-center justify-between pb-3 border-b border-[#2A2A2A]">
            <h2 className="font-serif text-base font-bold text-white flex items-center gap-2">
              <Info className="w-4 h-4 text-gold" />
              <span>Detalhes da Mídia</span>
            </h2>
            {selectedMedia && (
              <button
                onClick={() => setSelectedMedia(null)}
                className="text-stone-dark hover:text-white text-xs"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {selectedMedia ? (
            <div className="space-y-4 text-xs font-sans">
              {/* Preview */}
              <div className="aspect-video bg-[#101010] rounded border border-[#333] overflow-hidden flex items-center justify-center relative">
                {selectedMedia.public_url ? (
                  <img
                    src={selectedMedia.public_url}
                    alt={selectedMedia.alt_text || selectedMedia.filename}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <ImageIcon className="w-8 h-8 text-stone-dark" />
                )}
              </div>

              {/* Informações Técnicas */}
              <div className="space-y-2 font-mono text-[11px] bg-[#121212] p-3 rounded border border-[#252525]">
                <div className="flex justify-between">
                  <span className="text-stone-dark">Arquivo:</span>
                  <span className="text-white truncate max-w-[160px]" title={selectedMedia.original_name}>
                    {selectedMedia.original_name || selectedMedia.filename}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-dark">Tamanho:</span>
                  <span className="text-stone">
                    {(selectedMedia.size_bytes / 1024).toFixed(1)} KB
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-dark">Formato:</span>
                  <span className="text-stone">{selectedMedia.mime_type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-dark">Bucket:</span>
                  <span className="text-stone">{selectedMedia.bucket}</span>
                </div>
              </div>

              {/* URL Pública & Copiar */}
              {selectedMedia.public_url && (
                <div className="space-y-1.5">
                  <span className="font-mono text-[10px] text-stone-dark uppercase">
                    URL Pública do Arquivo
                  </span>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      readOnly
                      value={selectedMedia.public_url}
                      className="w-full p-2 bg-[#121212] border border-[#333] rounded text-[11px] font-mono text-stone truncate select-all"
                    />
                    <button
                      onClick={() => copyUrlToClipboard(selectedMedia.public_url!, selectedMedia.id)}
                      className="px-3 bg-gold hover:bg-gold-light text-night font-bold rounded flex items-center justify-center shrink-0 transition-colors"
                      title="Copiar URL"
                    >
                      {copiedId === selectedMedia.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-950" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* Botão de Excluir */}
              <div className="pt-3 border-t border-[#2A2A2A]">
                <button
                  onClick={() => handleDelete(selectedMedia)}
                  className="w-full flex items-center justify-center gap-2 py-2 bg-red-950/40 hover:bg-red-900/60 border border-red-800/60 rounded text-red-300 font-mono text-xs transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Excluir Mídia do Acervo</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="py-12 text-center text-stone-dark space-y-2">
              <ImageIcon className="w-8 h-8 mx-auto opacity-30" />
              <p className="text-xs">Selecione uma imagem na grade ao lado para ver seus detalhes.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
