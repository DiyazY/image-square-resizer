import { describe, it, expect, vi, beforeEach } from 'vitest';
import { squareCropResize } from '../src/resize';
import * as helpers from '../src/helpers';

// Helper to create a mock HTMLImageElement with given dimensions
function mockImage(width: number, height: number): HTMLImageElement {
  return { width, height } as HTMLImageElement;
}

describe('squareCropResize', () => {
  beforeEach(() => {
    vi.restoreAllMocks();

    // Mock loadImage to return a controllable image
    vi.spyOn(helpers, 'loadImage').mockResolvedValue(mockImage(400, 200));
  });

  it('returns a ResizeResult with correct shape', async () => {
    const blob = new Blob(['test'], { type: 'image/png' });
    const result = await squareCropResize(blob);

    expect(result).toHaveProperty('blob');
    expect(result).toHaveProperty('dataUrl');
    expect(result).toHaveProperty('size');
    expect(result).toHaveProperty('format');
  });

  it('defaults to center anchor, png format, and min dimension', async () => {
    const blob = new Blob(['test'], { type: 'image/png' });
    const result = await squareCropResize(blob);

    // 400x200 image, min=200, center crop means x=100
    expect(result.size).toBe(200);
    expect(result.format).toBe('image/png');
  });

  it('crops landscape image with center anchor', async () => {
    const cropSpy = vi.spyOn(helpers, 'cropAndDraw');
    const blob = new Blob(['test'], { type: 'image/png' });

    await squareCropResize(blob, { size: 100 });

    // 400x200 image, min=200, center: x = (400-200)/2 = 100, y = 0
    expect(cropSpy).toHaveBeenCalledWith(
      expect.anything(), // img
      100, // sourceX
      0,   // sourceY
      200, // sourceSize (min dimension)
      100, // outputSize
    );
  });

  it('crops portrait image with center anchor', async () => {
    vi.spyOn(helpers, 'loadImage').mockResolvedValue(mockImage(200, 400));
    const cropSpy = vi.spyOn(helpers, 'cropAndDraw');
    const blob = new Blob(['test'], { type: 'image/png' });

    await squareCropResize(blob, { size: 100 });

    // 200x400 image, min=200, center: x = 0, y = (400-200)/2 = 100
    expect(cropSpy).toHaveBeenCalledWith(
      expect.anything(),
      0,   // sourceX
      100, // sourceY
      200, // sourceSize
      100, // outputSize
    );
  });

  it('respects left anchor on landscape', async () => {
    const cropSpy = vi.spyOn(helpers, 'cropAndDraw');
    const blob = new Blob(['test'], { type: 'image/png' });

    await squareCropResize(blob, { size: 100, anchor: 'left' });

    expect(cropSpy).toHaveBeenCalledWith(
      expect.anything(),
      0,   // x = 0 (left anchor)
      0,   // y = excessY/2 = 0 (no excess on y for landscape)
      200, 100,
    );
  });

  it('respects right anchor on landscape', async () => {
    const cropSpy = vi.spyOn(helpers, 'cropAndDraw');
    const blob = new Blob(['test'], { type: 'image/png' });

    await squareCropResize(blob, { size: 100, anchor: 'right' });

    expect(cropSpy).toHaveBeenCalledWith(
      expect.anything(),
      200, // x = excessX = 400-200 = 200
      0,
      200, 100,
    );
  });

  it('respects top anchor on portrait', async () => {
    vi.spyOn(helpers, 'loadImage').mockResolvedValue(mockImage(200, 400));
    const cropSpy = vi.spyOn(helpers, 'cropAndDraw');
    const blob = new Blob(['test'], { type: 'image/png' });

    await squareCropResize(blob, { size: 100, anchor: 'top' });

    expect(cropSpy).toHaveBeenCalledWith(
      expect.anything(),
      0,   // x = excessX/2 = 0
      0,   // y = 0 (top anchor)
      200, 100,
    );
  });

  it('respects bottom anchor on portrait', async () => {
    vi.spyOn(helpers, 'loadImage').mockResolvedValue(mockImage(200, 400));
    const cropSpy = vi.spyOn(helpers, 'cropAndDraw');
    const blob = new Blob(['test'], { type: 'image/png' });

    await squareCropResize(blob, { size: 100, anchor: 'bottom' });

    expect(cropSpy).toHaveBeenCalledWith(
      expect.anything(),
      0,
      200, // y = excessY = 400-200 = 200
      200, 100,
    );
  });

  it('respects bottom-right anchor', async () => {
    const cropSpy = vi.spyOn(helpers, 'cropAndDraw');
    const blob = new Blob(['test'], { type: 'image/png' });

    await squareCropResize(blob, { size: 100, anchor: 'bottom-right' });

    // 400x200, min=200, excessX=200, excessY=0
    expect(cropSpy).toHaveBeenCalledWith(
      expect.anything(),
      200, // x = excessX
      0,   // y = excessY
      200, 100,
    );
  });

  it('does not upscale images smaller than target size', async () => {
    vi.spyOn(helpers, 'loadImage').mockResolvedValue(mockImage(50, 50));
    const blob = new Blob(['test'], { type: 'image/png' });

    const result = await squareCropResize(blob, { size: 300 });
    expect(result.size).toBe(50);
  });

  it('handles already square image', async () => {
    vi.spyOn(helpers, 'loadImage').mockResolvedValue(mockImage(300, 300));
    const cropSpy = vi.spyOn(helpers, 'cropAndDraw');
    const blob = new Blob(['test'], { type: 'image/png' });

    const result = await squareCropResize(blob, { size: 300 });

    expect(result.size).toBe(300);
    expect(cropSpy).toHaveBeenCalledWith(
      expect.anything(),
      0, 0, 300, 300,
    );
  });

  it('passes format and quality through', async () => {
    const outputSpy = vi.spyOn(helpers, 'canvasToOutput');
    const blob = new Blob(['test'], { type: 'image/png' });

    await squareCropResize(blob, { format: 'image/jpeg', quality: 0.8 });

    expect(outputSpy).toHaveBeenCalledWith(
      expect.anything(),
      'image/jpeg',
      0.8,
    );
  });

  it('skips loadImage when given an HTMLImageElement', async () => {
    const loadSpy = vi.spyOn(helpers, 'loadImage');
    const img = new Image();
    Object.defineProperty(img, 'width', { value: 100 });
    Object.defineProperty(img, 'height', { value: 100 });

    await squareCropResize(img);

    expect(loadSpy).not.toHaveBeenCalled();
  });
});
