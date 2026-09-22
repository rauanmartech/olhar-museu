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
 * Calcula as dimensões de cover: escala a imagem para preencher
 * completamente o envelope (sem barras pretas). O excesso é cortado
 * ao centralizar no canvas.
 */
function calcCoverDimensions(
  srcW: number,
  srcH: number,
  targetW: number,
  targetH: number
): { w: number; h: number } {
  const scaleW = targetW / srcW;
  const scaleH = targetH / srcH;
  // Usa o maior scale para que a imagem cubra o canvas inteiro
  const scale = Math.max(scaleW, scaleH);

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

  // Cover: escala para preencher o canvas inteiro, sem barras pretas
  const { w: drawW, h: drawH } = calcCoverDimensions(
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

  // Centraliza e corta o excesso (cover crop)
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
