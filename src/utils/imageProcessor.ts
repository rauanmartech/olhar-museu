/**
 * imageProcessor.ts
 * Utilitário client-side de processamento de imagem via Canvas API.
 *
 * Processa qualquer imagem de entrada:
 * 1. Redimensiona para caber em 1920×1080 (sem upscale, sem distorção)
 * 2. Aplica letterbox com fundo preto quando o aspect ratio diferir
 * 3. Converte para WebP (qualidade 0.88)
 *
 * Não possui dependências externas — usa apenas APIs nativas do browser.
 */

const TARGET_WIDTH = 1920;
const TARGET_HEIGHT = 1080;
const WEBP_QUALITY = 0.88;

/**
 * Carrega um File/Blob como HTMLImageElement.
 */
function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Não foi possível carregar a imagem selecionada."));
    };
    img.src = url;
  });
}

/**
 * Calcula as dimensões de destino mantendo aspect ratio dentro de um envelope.
 * Nunca faz upscale.
 */
function calcFitDimensions(
  srcW: number,
  srcH: number,
  maxW: number,
  maxH: number
): { w: number; h: number } {
  if (srcW <= maxW && srcH <= maxH) {
    // Imagem menor que o alvo — não faz upscale
    return { w: srcW, h: srcH };
  }

  const scaleW = maxW / srcW;
  const scaleH = maxH / srcH;
  const scale = Math.min(scaleW, scaleH);

  return {
    w: Math.round(srcW * scale),
    h: Math.round(srcH * scale),
  };
}

/**
 * Processa uma imagem de capa de museu:
 * - Redimensiona para no máximo 1920×1080 (sem upscale, sem distorção)
 * - Centraliza sobre fundo preto (letterbox)
 * - Converte para WebP
 *
 * @param file  Arquivo de imagem de entrada (qualquer formato suportado pelo browser)
 * @param outputName  Nome do arquivo de saída (padrão: "capa.webp")
 * @returns  Promise<File> com a imagem processada em WebP
 */
export async function processMuseumCover(
  file: File,
  outputName = "capa.webp"
): Promise<File> {
  const img = await loadImage(file);

  const { w: drawW, h: drawH } = calcFitDimensions(
    img.naturalWidth,
    img.naturalHeight,
    TARGET_WIDTH,
    TARGET_HEIGHT
  );

  // O canvas sempre tem exatamente TARGET_WIDTH × TARGET_HEIGHT
  const canvas = document.createElement("canvas");
  canvas.width = TARGET_WIDTH;
  canvas.height = TARGET_HEIGHT;

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Canvas 2D não disponível neste ambiente.");
  }

  // Fundo preto (letterbox)
  ctx.fillStyle = "#000000";
  ctx.fillRect(0, 0, TARGET_WIDTH, TARGET_HEIGHT);

  // Centraliza a imagem no canvas
  const offsetX = Math.round((TARGET_WIDTH - drawW) / 2);
  const offsetY = Math.round((TARGET_HEIGHT - drawH) / 2);
  ctx.drawImage(img, offsetX, offsetY, drawW, drawH);

  // Converte para Blob WebP
  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (b) => {
        if (b) resolve(b);
        else reject(new Error("Falha ao converter a imagem para WebP."));
      },
      "image/webp",
      WEBP_QUALITY
    );
  });

  return new File([blob], outputName, { type: "image/webp" });
}

/**
 * Retorna uma string legível do tamanho em bytes.
 * Ex: 1048576 → "1,0 MB"
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
