"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  AdminEditorialService,
  DatabaseMuseum,
} from "@/lib/services/adminEditorialService";
import { processMuseumCover, formatFileSize } from "@/utils/imageProcessor";
import {
  Landmark,
  Upload,
  CheckCircle2,
  XCircle,
  Loader2,
  ImageIcon,
  RefreshCw,
  Info,
} from "lucide-react";

// ─── Tipos locais ────────────────────────────────────────────────────────────

type UploadStatus = "idle" | "processing" | "uploading" | "success" | "error";

interface MuseumCoverState {
  museum: DatabaseMuseum;
  status: UploadStatus;
  /** URL pública da capa atual (Supabase ou placeholder local) */
  previewUrl: string;
  /** Preview temporário do arquivo selecionado (object URL) */
  pendingPreviewUrl?: string;
  /** Mensagem de feedback por museu */
  message?: string;
  /** Tamanho do arquivo original */
  originalSize?: number;
  /** Tamanho após conversão WebP */
  processedSize?: number;
}

// ─── Componente de Card de Museu ────────────────────────────────────────────

interface MuseumCoverCardProps {
  state: MuseumCoverState;
  onFileSelected: (museumId: string, file: File) => void;
}

function MuseumCoverCard({ state, onFileSelected }: MuseumCoverCardProps) {
  const { museum, status, previewUrl, pendingPreviewUrl, message, originalSize, processedSize } =
    state;
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const displayUrl = pendingPreviewUrl || previewUrl;
  const isBusy = status === "processing" || status === "uploading";

  const handleFile = (file: File) => {
    if (!file.type.startsWith("image/")) return;
    onFileSelected(museum.id, file);
  };

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [museum.id]
  );

  const statusColors: Record<UploadStatus, string> = {
    idle: "border-[#2C2C2C]",
    processing: "border-gold/60 shadow-gold/10 shadow-lg",
    uploading: "border-gold/80 shadow-gold/15 shadow-lg",
    success: "border-emerald-600/70 shadow-emerald-900/20 shadow-lg",
    error: "border-red-700/60 shadow-red-900/20 shadow-lg",
  };

  return (
    <div
      className={`bg-[#171717] rounded-lg border overflow-hidden flex flex-col transition-all duration-300 ${statusColors[status]}`}
    >
      {/* Preview da imagem de capa */}
      <div
        className={`relative aspect-video w-full bg-[#0D0D0D] overflow-hidden group cursor-pointer transition-colors ${
          isDragging ? "bg-gold/5 border-2 border-dashed border-gold" : ""
        }`}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => !isBusy && inputRef.current?.click()}
        title="Clique ou arraste uma imagem para alterar a capa"
      >
        {displayUrl ? (
          <img
            src={displayUrl}
            alt={`Capa de ${museum.name}`}
            className={`w-full h-full object-cover transition-all duration-500 ${
              isBusy ? "opacity-40 blur-sm" : "group-hover:scale-105"
            }`}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-[#333]">
            <Landmark className="w-10 h-10" />
            <span className="font-mono text-[10px] uppercase tracking-widest">
              Sem capa cadastrada
            </span>
          </div>
        )}

        {/* Overlay de hover / drag */}
        {!isBusy && (
          <div
            className={`absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/60 backdrop-blur-sm transition-opacity duration-200 ${
              isDragging ? "opacity-100" : "opacity-0 group-hover:opacity-100"
            }`}
          >
            <Upload className="w-7 h-7 text-gold" />
            <span className="text-xs font-mono text-white">
              {isDragging ? "Solte para enviar" : "Clique ou arraste uma imagem"}
            </span>
            <span className="text-[10px] font-mono text-stone-dark">
              JPG, PNG, WebP, AVIF → convertido para WebP 1920×1080
            </span>
          </div>
        )}

        {/* Overlay de processamento / upload */}
        {isBusy && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/70 backdrop-blur-sm">
            <Loader2 className="w-8 h-8 text-gold animate-spin" />
            <span className="text-xs font-mono text-gold">
              {status === "processing" ? "Convertendo para WebP..." : "Enviando ao Supabase..."}
            </span>
          </div>
        )}

        {/* Badge de status */}
        {status === "success" && (
          <div className="absolute top-2 right-2 flex items-center gap-1.5 bg-emerald-900/90 border border-emerald-700 px-2 py-1 rounded text-emerald-300 text-[10px] font-mono">
            <CheckCircle2 className="w-3 h-3" />
            Capa atualizada
          </div>
        )}
        {status === "error" && (
          <div className="absolute top-2 right-2 flex items-center gap-1.5 bg-red-950/90 border border-red-800 px-2 py-1 rounded text-red-300 text-[10px] font-mono">
            <XCircle className="w-3 h-3" />
            Erro no upload
          </div>
        )}

        {/* Indicador de resolução alvo */}
        <div className="absolute bottom-2 left-2 bg-black/70 border border-[#333] px-1.5 py-0.5 rounded font-mono text-[9px] text-stone-dark">
          1920 × 1080 · WebP
        </div>
      </div>

      {/* Rodapé do card */}
      <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="font-serif text-sm font-bold text-white leading-tight">
            {museum.name}
          </h3>
          <p className="font-mono text-[10px] text-stone-dark mt-0.5">
            /{museum.slug}
          </p>
        </div>

        {/* Info de tamanho após conversão */}
        {processedSize && originalSize && (
          <div className="flex items-center gap-1.5 text-[10px] font-mono text-stone-dark">
            <Info className="w-3 h-3 text-gold shrink-0" />
            <span>
              {formatFileSize(originalSize)} → {formatFileSize(processedSize)}{" "}
              <span className="text-emerald-500">
                (−{Math.round((1 - processedSize / originalSize) * 100)}%)
              </span>
            </span>
          </div>
        )}

        {/* Mensagem de erro inline */}
        {status === "error" && message && (
          <p className="text-[10px] font-mono text-red-400 leading-relaxed">
            {message}
          </p>
        )}

        <button
          onClick={() => !isBusy && inputRef.current?.click()}
          disabled={isBusy}
          className="mt-2 w-full flex items-center justify-center gap-2 py-2 bg-[#222] hover:bg-[#2A2A2A] border border-[#333] hover:border-gold/40 rounded text-xs font-mono text-stone hover:text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
        >
          {isBusy ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>{status === "processing" ? "Processando..." : "Enviando..."}</span>
            </>
          ) : (
            <>
              <Upload className="w-3.5 h-3.5 text-gold" />
              <span>{previewUrl ? "Trocar Capa" : "Definir Capa"}</span>
            </>
          )}
        </button>
      </div>

      {/* Input oculto */}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
          // Limpa o value para permitir reselecionar o mesmo arquivo
          e.target.value = "";
        }}
        disabled={isBusy}
      />
    </div>
  );
}

// ─── Página Principal ────────────────────────────────────────────────────────

export default function AdminMuseumCoversPage() {
  const [coverStates, setCoverStates] = useState<MuseumCoverState[]>([]);
  const [loading, setLoading] = useState(true);
  const [globalMessage, setGlobalMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Guarda object URLs criados para revogar ao desmontar
  const pendingUrls = useRef<string[]>([]);

  useEffect(() => {
    loadMuseums();
    return () => {
      // Limpa object URLs ao desmontar
      pendingUrls.current.forEach(URL.revokeObjectURL);
    };
  }, []);

  const loadMuseums = async () => {
    setLoading(true);
    try {
      const museums = await AdminEditorialService.getMuseums();
      setCoverStates(
        museums.map((m) => ({
          museum: m,
          status: "idle",
          previewUrl: m.featured_image?.public_url || "",
        }))
      );
    } catch {
      setGlobalMessage({ type: "error", text: "Erro ao carregar museus do Supabase." });
    } finally {
      setLoading(false);
    }
  };

  const updateState = (museumId: string, patch: Partial<MuseumCoverState>) => {
    setCoverStates((prev) =>
      prev.map((s) => (s.museum.id === museumId ? { ...s, ...patch } : s))
    );
  };

  const handleFileSelected = async (museumId: string, rawFile: File) => {
    // Cria preview temporário imediatamente para feedback visual rápido
    const pendingUrl = URL.createObjectURL(rawFile);
    pendingUrls.current.push(pendingUrl);

    updateState(museumId, {
      status: "processing",
      pendingPreviewUrl: pendingUrl,
      originalSize: rawFile.size,
      message: undefined,
    });

    try {
      // ── 1. Processamento: resize + conversão WebP (Canvas API) ──
      const processedFile = await processMuseumCover(rawFile, "capa.webp");

      updateState(museumId, {
        status: "uploading",
        processedSize: processedFile.size,
      });

      // ── 2. Upload ao Supabase Storage via adminEditorialService ──
      const museum = coverStates.find((s) => s.museum.id === museumId)?.museum;
      const altText = museum ? `Capa — ${museum.name}` : "Capa do museu";

      const mediaRecord = await AdminEditorialService.uploadMedia(processedFile, {
        alt_text: altText,
        caption: `Imagem de capa · 1920×1080 · WebP · ${new Date().toLocaleDateString("pt-BR")}`,
      });

      // ── 3. Vincula ao museu como featured_image ──
      await AdminEditorialService.updateMuseum(museumId, {
        featured_image_id: mediaRecord.id,
      } as any);

      // Revoga o object URL temporário
      URL.revokeObjectURL(pendingUrl);
      pendingUrls.current = pendingUrls.current.filter((u) => u !== pendingUrl);

      updateState(museumId, {
        status: "success",
        previewUrl: mediaRecord.public_url || pendingUrl,
        pendingPreviewUrl: undefined,
        message: undefined,
      });

      setGlobalMessage({
        type: "success",
        text: `Capa de "${museum?.name}" atualizada com sucesso! A imagem foi convertida para WebP 1920×1080.`,
      });

      // Limpa o badge de sucesso após 4 s
      setTimeout(() => {
        updateState(museumId, { status: "idle" });
      }, 4000);
    } catch (err: any) {
      URL.revokeObjectURL(pendingUrl);
      pendingUrls.current = pendingUrls.current.filter((u) => u !== pendingUrl);

      updateState(museumId, {
        status: "error",
        pendingPreviewUrl: undefined,
        message: err.message || "Erro desconhecido durante o processamento.",
      });
    }
  };

  const successCount = coverStates.filter((s) => s.previewUrl).length;
  const totalCount = coverStates.length;

  return (
    <div className="space-y-8">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 pb-6 border-b border-[#262626]">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-gold" />
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Capas dos Museus
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-stone-dark font-sans max-w-xl">
            Gerencie as imagens de capa exibidas na página pública de cada museu.
            Qualquer formato de imagem é aceito — o sistema converte automaticamente
            para <span className="text-gold font-mono">WebP 1920×1080</span> antes do upload.
          </p>

          {/* Barra de progresso geral */}
          {!loading && totalCount > 0 && (
            <div className="flex items-center gap-3 pt-1">
              <div className="flex-1 max-w-48 h-1.5 bg-[#222] rounded-full overflow-hidden">
                <div
                  className="h-full bg-gold rounded-full transition-all duration-700"
                  style={{ width: `${(successCount / totalCount) * 100}%` }}
                />
              </div>
              <span className="font-mono text-[10px] text-stone-dark">
                {successCount}/{totalCount} museus com capa
              </span>
            </div>
          )}
        </div>

        <button
          onClick={loadMuseums}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#222] hover:bg-[#2A2A2A] border border-[#333] rounded text-xs font-mono text-stone hover:text-white transition-all disabled:opacity-40 self-start cursor-pointer"
          title="Recarregar lista de museus"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          <span>Recarregar</span>
        </button>
      </div>

      {/* Feedback global */}
      {globalMessage && (
        <div
          className={`p-3.5 rounded text-xs flex items-start justify-between gap-3 ${
            globalMessage.type === "success"
              ? "bg-emerald-950/70 border border-emerald-800 text-emerald-200"
              : "bg-red-950/70 border border-red-800 text-red-200"
          }`}
        >
          <span>{globalMessage.text}</span>
          <button
            onClick={() => setGlobalMessage(null)}
            className="text-current opacity-60 hover:opacity-100 shrink-0"
          >
            ✕
          </button>
        </div>
      )}

      {/* Painel informativo */}
      <div className="flex items-start gap-3 bg-[#1A1A0A] border border-gold/20 rounded-lg p-4 text-xs font-sans text-stone-dark">
        <Info className="w-4 h-4 text-gold shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="text-gold font-mono font-semibold text-[11px] uppercase tracking-wider">
            Pipeline de processamento automático
          </p>
          <p>
            Ao selecionar ou arrastar uma imagem, o sistema executa no seu browser:
            {" "}<strong className="text-white">1)</strong> Redimensiona para caber em 1920×1080 (sem distorção, letterbox preto se necessário){" "}
            →{" "}<strong className="text-white">2)</strong> Converte para WebP com qualidade 88%{" "}
            →{" "}<strong className="text-white">3)</strong> Faz upload ao Supabase Storage{" "}
            →{" "}<strong className="text-white">4)</strong> Vincula automaticamente como capa do museu.
          </p>
        </div>
      </div>

      {/* Grid de cards */}
      {loading ? (
        <div className="py-32 flex flex-col items-center justify-center gap-3 text-stone-dark">
          <Loader2 className="w-8 h-8 text-gold animate-spin" />
          <p className="font-mono text-xs">Carregando museus parceiros...</p>
        </div>
      ) : coverStates.length === 0 ? (
        <div className="py-32 flex flex-col items-center justify-center gap-3 text-stone-dark">
          <Landmark className="w-12 h-12 opacity-20" />
          <p className="text-sm">Nenhum museu encontrado no Supabase.</p>
          <p className="font-mono text-xs">
            Cadastre museus em{" "}
            <a href="/admin/museus" className="text-gold hover:underline">
              /admin/museus
            </a>{" "}
            primeiro.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {coverStates.map((state) => (
            <MuseumCoverCard
              key={state.museum.id}
              state={state}
              onFileSelected={handleFileSelected}
            />
          ))}
        </div>
      )}
    </div>
  );
}
