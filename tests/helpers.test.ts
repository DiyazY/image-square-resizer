import { describe, it, expect, vi, beforeEach } from 'vitest';
import { loadImage, cropAndDraw, canvasToOutput } from '../src/helpers';

describe('loadImage', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('resolves with an HTMLImageElement on success', async () => {
    const blob = new Blob(['fake'], { type: 'image/png' });

    // Mock Image to fire onload synchronously when src is set
    const origImage = globalThis.Image;
    globalThis.Image = class MockImage {
      width = 100;
      height = 200;
      onload: (() => void) | null = null;
      onerror: (() => void) | null = null;
      private _src = '';
      get src() { return this._src; }
      set src(val: string) {
        this._src = val;
        setTimeout(() => this.onload?.(), 0);
      }
    } as any;

    const img = await loadImage(blob);
    expect(img).toBeDefined();
    expect(img.src).toBe('blob:mock-url');

    globalThis.Image = origImage;
  });

  it('rejects on image load error', async () => {
    const blob = new Blob(['bad'], { type: 'image/png' });

    const origImage = globalThis.Image;
    globalThis.Image = class MockImage {
      onload: (() => void) | null = null;
      onerror: (() => void) | null = null;
      private _src = '';
      get src() { return this._src; }
      set src(val: string) {
        this._src = val;
        setTimeout(() => this.onerror?.(), 0);
      }
    } as any;

    await expect(loadImage(blob)).rejects.toThrow('Failed to load image');

    globalThis.Image = origImage;
  });

  it('revokes the object URL after loading', async () => {
    const revokeSpy = vi.spyOn(URL, 'revokeObjectURL');
    const blob = new Blob(['fake'], { type: 'image/png' });

    const origImage = globalThis.Image;
    globalThis.Image = class MockImage {
      onload: (() => void) | null = null;
      onerror: (() => void) | null = null;
      private _src = '';
      get src() { return this._src; }
      set src(val: string) {
        this._src = val;
        setTimeout(() => this.onload?.(), 0);
      }
    } as any;

    await loadImage(blob);
    expect(revokeSpy).toHaveBeenCalledWith('blob:mock-url');

    globalThis.Image = origImage;
  });
});

describe('cropAndDraw', () => {
  it('creates a canvas with the correct output dimensions', () => {
    const img = { width: 400, height: 200 } as HTMLImageElement;
    const canvas = cropAndDraw(img, 100, 0, 200, 150);
    expect(canvas.width).toBe(150);
    expect(canvas.height).toBe(150);
  });

  it('calls drawImage with correct source and destination args', () => {
    const img = { width: 400, height: 200 } as HTMLImageElement;
    const canvas = cropAndDraw(img, 50, 25, 200, 100);
    const ctx = canvas.getContext('2d')!;
    expect(ctx.drawImage).toHaveBeenCalledWith(img, 50, 25, 200, 200, 0, 0, 100, 100);
  });
});

describe('canvasToOutput', () => {
  it('returns both dataUrl and blob', async () => {
    const canvas = document.createElement('canvas');
    canvas.width = 100;
    canvas.height = 100;

    const result = await canvasToOutput(canvas, 'image/png', 0.92);
    expect(result.dataUrl).toContain('data:image/png');
    expect(result.blob).toBeInstanceOf(Blob);
  });

  it('passes format and quality to toDataURL', async () => {
    const canvas = document.createElement('canvas');
    const spy = vi.spyOn(canvas, 'toDataURL');

    await canvasToOutput(canvas, 'image/jpeg', 0.8);
    expect(spy).toHaveBeenCalledWith('image/jpeg', 0.8);
  });

  it('calls toDataURL exactly once', async () => {
    const canvas = document.createElement('canvas');
    const spy = vi.spyOn(canvas, 'toDataURL');

    await canvasToOutput(canvas, 'image/png', 0.92);
    expect(spy).toHaveBeenCalledTimes(1);
  });
});
