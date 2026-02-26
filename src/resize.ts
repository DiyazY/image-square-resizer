import type { CropAnchor, ResizeOptions, ResizeResult, OutputFormat } from './types';
import { loadImage, cropAndDraw, canvasToOutput } from './helpers';

function computeCropOrigin(
  imgWidth: number,
  imgHeight: number,
  cropSize: number,
  anchor: CropAnchor,
): { x: number; y: number } {
  const excessX = imgWidth - cropSize;
  const excessY = imgHeight - cropSize;

  let x: number;
  let y: number;

  switch (anchor) {
    case 'top-left':     x = 0;              y = 0;              break;
    case 'top':          x = excessX / 2;    y = 0;              break;
    case 'top-right':    x = excessX;        y = 0;              break;
    case 'left':         x = 0;              y = excessY / 2;    break;
    case 'center':       x = excessX / 2;    y = excessY / 2;    break;
    case 'right':        x = excessX;        y = excessY / 2;    break;
    case 'bottom-left':  x = 0;              y = excessY;        break;
    case 'bottom':       x = excessX / 2;    y = excessY;        break;
    case 'bottom-right': x = excessX;        y = excessY;        break;
  }

  return { x: Math.round(x), y: Math.round(y) };
}

export async function squareCropResize(
  input: File | Blob | HTMLImageElement,
  options?: ResizeOptions,
): Promise<ResizeResult> {
  const format: OutputFormat = options?.format ?? 'image/png';
  const quality = options?.quality ?? 0.92;
  const anchor: CropAnchor = options?.anchor ?? 'center';

  const img = input instanceof HTMLImageElement
    ? input
    : await loadImage(input);

  const { width, height } = img;
  const min = Math.min(width, height);
  const outputSize = options?.size ? Math.min(options.size, min) : min;

  const { x, y } = computeCropOrigin(width, height, min, anchor);
  const canvas = cropAndDraw(img, x, y, min, outputSize);
  const { dataUrl, blob } = await canvasToOutput(canvas, format, quality);

  return { blob, dataUrl, size: outputSize, format };
}
