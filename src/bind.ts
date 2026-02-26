import type { ResizeOptions, ResizeResult } from './types';
import { squareCropResize } from './resize';

export interface BindOptions extends ResizeOptions {
  onResult: (result: ResizeResult) => void;
  onError?: (error: Error) => void;
}

export function bindFileInput(
  element: HTMLInputElement,
  options: BindOptions,
): () => void {
  const { onResult, onError, ...resizeOptions } = options;

  const handler = async () => {
    const files = element.files;
    if (!files) return;
    for (const file of Array.from(files)) {
      if (!file.type.startsWith('image/')) {
        onError?.(new Error(`Not an image: ${file.name}`));
        continue;
      }
      try {
        const result = await squareCropResize(file, resizeOptions);
        onResult(result);
      } catch (err) {
        onError?.(err instanceof Error ? err : new Error(String(err)));
      }
    }
  };

  element.addEventListener('change', handler);
  return () => element.removeEventListener('change', handler);
}
