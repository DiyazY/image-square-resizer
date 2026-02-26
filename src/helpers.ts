import type { OutputFormat } from './types';

export function loadImage(source: Blob): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(source);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image'));
    };
    img.src = url;
  });
}

export function cropAndDraw(
  img: HTMLImageElement,
  sourceX: number,
  sourceY: number,
  sourceSize: number,
  outputSize: number,
): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = outputSize;
  canvas.height = outputSize;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Failed to get canvas 2d context');
  ctx.drawImage(img, sourceX, sourceY, sourceSize, sourceSize, 0, 0, outputSize, outputSize);
  return canvas;
}

export function canvasToOutput(
  canvas: HTMLCanvasElement,
  format: OutputFormat,
  quality: number,
): Promise<{ dataUrl: string; blob: Blob }> {
  const dataUrl = canvas.toDataURL(format, quality);
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('Failed to create blob from canvas'));
          return;
        }
        resolve({ dataUrl, blob });
      },
      format,
      quality,
    );
  });
}
