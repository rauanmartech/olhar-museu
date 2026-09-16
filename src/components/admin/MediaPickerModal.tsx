"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { AdminEditorialService, DatabaseMedia } from "@/lib/services/adminEditorialService";
import { X, Upload, Check, Search, Loader2, Image as ImageIcon, Trash2 } from "lucide-react";

interface MediaPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (media: DatabaseMedia) => void;
  selectedMediaId?: string | null;
}

export function MediaPickerModal({
  isOpen,
  onClose,
  onSelect,
  selectedMediaId,
}: MediaPickerModalProps) {
  const [mediaList, setMediaList] = useState<DatabaseMedia[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [search, setSearch] = useState("");
  const [altText, setAltText] = useState("");
  const [caption, setCaption] = useState("");
  const [uploadError, setUploadError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadMedia();
    }
  }, [isOpen]);

  const loadMedia = async () => {
    setLoading(true);
    try {
      const data = await AdminEditorialService.getMediaList();
      setMediaList(data);
    } catch {
      // Silencioso
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadError(null);

    try {
      const newMedia = await AdminEditorialService.uploadMedia(file, {
        alt_text: altText,
        caption: caption,
      });

      setMediaList((prev) => [newMedia, ...prev]);
      onSelect(newMedia);
      setAltText("");
      setCaption("");
      onClose();
    } catch (err: any) {
      setUploadError(err.message || "Erro ao realizar upload da imagem.");
    } finally {
      setUploading(false);
    }
  };

  if (!isOpen) return null;

  const filteredMedia = mediaList.filter((m) =>
    (m.filename || "").toLowerCase().includes(search.toLowerCase()) ||
    (m.alt_text || "").toLowerCase().includes(search.toLowerCase()) ||
    (m.caption || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#171717] border border-[#333333] rounded-lg w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden font-sans">
        {/* Topo do Modal */}
        <div className="p-4 sm:p-5 border-b border-[#2A2A2A] flex items-center justify-between bg-[#141414]">
          <div className="flex items-center gap-2.5">
            <ImageIcon className="w-5 h-5 text-gold" />
            <h3 className="font-serif text-lg font-bold text-white">
              Selecionar ou Enviar Imagem
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-stone-dark hover:text-white rounded hover:bg-[#222222] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Barra de Busca e Upload */}
        <div className="p-4 border-b border-[#262626] bg-[#1A1A1A] flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-stone-dark absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar imagem..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-[#121212] border border-[#333] rounded text-xs text-white placeholder:text-stone-dark focus:outline-none focus:border-gold"
            />
          </div>

          <label className="w-full sm:w-auto cursor-pointer inline-flex items-center justify-center gap-2 px-4 py-2 bg-gold hover:bg-gold-light text-night font-bold text-xs rounded transition-all">
            {uploading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Enviando...</span>
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                <span>Upload de Nova Imagem</span>
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

        {uploadError && (
          <div className="p-3 bg-red-950/70 border-b border-red-900 text-red-200 text-xs">
            {uploadError}
          </div>
        )}

        {/* Grade de Imagens */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 bg-[#0F0F0F]">
          {loading ? (
            <div className="py-20 text-center flex flex-col items-center justify-center">
              <Loader2 className="w-8 h-8 text-gold animate-spin mb-2" />
              <p className="font-mono text-xs text-stone-dark">Carregando acervo de mídia...</p>
            </div>
          ) : filteredMedia.length === 0 ? (
            <div className="py-20 text-center text-stone-dark space-y-2">
              <ImageIcon className="w-10 h-10 mx-auto text-stone-dark/40" />
              <p className="text-sm font-sans">Nenhuma imagem encontrada no acervo.</p>
              <p className="text-xs font-mono text-stone-dark">
                Clique no botão de upload acima para adicionar a primeira foto.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {filteredMedia.map((item) => {
                const isSelected = selectedMediaId === item.id;
                return (
                  <div
                    key={item.id}
                    onClick={() => {
                      onSelect(item);
                      onClose();
                    }}
                    className={`group relative aspect-video sm:aspect-square bg-[#1C1C1C] rounded border overflow-hidden cursor-pointer transition-all hover:border-gold ${
                      isSelected
                        ? "border-gold ring-2 ring-gold"
                        : "border-[#2A2A2A]"
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

                    {/* Overlay de Seleção */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="px-2.5 py-1 bg-gold text-night text-xs font-bold rounded">
                        Selecionar
                      </span>
                    </div>

                    {isSelected && (
                      <div className="absolute top-2 right-2 bg-gold text-night rounded-full p-1 shadow">
                        <Check className="w-3.5 h-3.5" />
                      </div>
                    )}

                    <div className="absolute bottom-0 left-0 right-0 p-1.5 bg-black/75 backdrop-blur-sm text-[10px] font-mono text-stone truncate">
                      {item.alt_text || item.filename}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Rodapé do Modal */}
        <div className="p-4 border-t border-[#2A2A2A] bg-[#141414] flex items-center justify-between text-xs font-mono text-stone-dark">
          <span>{filteredMedia.length} mídias cadastradas</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-[#222222] hover:bg-[#2C2C2C] text-stone hover:text-white rounded transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
