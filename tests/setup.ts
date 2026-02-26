import { vi } from 'vitest';

// Mock URL.createObjectURL / revokeObjectURL
if (typeof URL.createObjectURL === 'undefined') {
  URL.createObjectURL = vi.fn(() => 'blob:mock-url');
}
if (typeof URL.revokeObjectURL === 'undefined') {
  URL.revokeObjectURL = vi.fn();
}

// Cache contexts per canvas so getContext returns the same object each time
const ctxCache = new WeakMap<HTMLCanvasElement, CanvasRenderingContext2D>();

HTMLCanvasElement.prototype.getContext = vi.fn(function (this: HTMLCanvasElement) {
  let ctx = ctxCache.get(this);
  if (!ctx) {
    ctx = {
      drawImage: vi.fn(),
      clearRect: vi.fn(),
      fillRect: vi.fn(),
    } as unknown as CanvasRenderingContext2D;
    ctxCache.set(this, ctx);
  }
  return ctx;
}) as any;

HTMLCanvasElement.prototype.toDataURL = vi.fn(function (
  this: HTMLCanvasElement,
  format?: string,
  _quality?: number,
) {
  return `data:${format ?? 'image/png'};base64,mockdata`;
});

HTMLCanvasElement.prototype.toBlob = vi.fn(function (
  this: HTMLCanvasElement,
  cb: BlobCallback,
  format?: string,
) {
  cb(new Blob(['mock'], { type: format ?? 'image/png' }));
});
