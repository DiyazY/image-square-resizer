import { describe, it, expect, vi, beforeEach } from 'vitest';
import { bindFileInput } from '../src/bind';
import * as resize from '../src/resize';

function createMockInput(files: File[] = []): HTMLInputElement {
  const input = document.createElement('input');
  input.type = 'file';
  Object.defineProperty(input, 'files', {
    value: files,
    writable: true,
  });
  return input;
}

describe('bindFileInput', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.spyOn(resize, 'squareCropResize').mockResolvedValue({
      blob: new Blob(['mock']),
      dataUrl: 'data:image/png;base64,mock',
      size: 100,
      format: 'image/png',
    });
  });

  it('adds a change event listener to the input', () => {
    const input = createMockInput();
    const spy = vi.spyOn(input, 'addEventListener');

    bindFileInput(input, { onResult: vi.fn() });

    expect(spy).toHaveBeenCalledWith('change', expect.any(Function));
  });

  it('returns a cleanup function that removes the listener', () => {
    const input = createMockInput();
    const removeSpy = vi.spyOn(input, 'removeEventListener');

    const cleanup = bindFileInput(input, { onResult: vi.fn() });
    cleanup();

    expect(removeSpy).toHaveBeenCalledWith('change', expect.any(Function));
  });

  it('calls onResult for each image file on change', async () => {
    const file = new File(['data'], 'photo.png', { type: 'image/png' });
    const input = createMockInput([file]);
    const onResult = vi.fn();

    bindFileInput(input, { onResult });

    input.dispatchEvent(new Event('change'));

    // Wait for async processing
    await vi.waitFor(() => {
      expect(onResult).toHaveBeenCalledTimes(1);
    });
  });

  it('calls onError for non-image files', async () => {
    const file = new File(['data'], 'doc.txt', { type: 'text/plain' });
    const input = createMockInput([file]);
    const onResult = vi.fn();
    const onError = vi.fn();

    bindFileInput(input, { onResult, onError });

    input.dispatchEvent(new Event('change'));

    await vi.waitFor(() => {
      expect(onError).toHaveBeenCalledWith(expect.any(Error));
    });
    expect(onResult).not.toHaveBeenCalled();
  });

  it('calls onError when squareCropResize fails', async () => {
    vi.spyOn(resize, 'squareCropResize').mockRejectedValue(new Error('canvas error'));

    const file = new File(['data'], 'photo.png', { type: 'image/png' });
    const input = createMockInput([file]);
    const onResult = vi.fn();
    const onError = vi.fn();

    bindFileInput(input, { onResult, onError });

    input.dispatchEvent(new Event('change'));

    await vi.waitFor(() => {
      expect(onError).toHaveBeenCalledWith(expect.any(Error));
    });
    expect(onResult).not.toHaveBeenCalled();
  });

  it('passes resize options through to squareCropResize', async () => {
    const resizeSpy = vi.spyOn(resize, 'squareCropResize');
    const file = new File(['data'], 'photo.png', { type: 'image/png' });
    const input = createMockInput([file]);

    bindFileInput(input, {
      size: 200,
      format: 'image/jpeg',
      quality: 0.7,
      anchor: 'top',
      onResult: vi.fn(),
    });

    input.dispatchEvent(new Event('change'));

    await vi.waitFor(() => {
      expect(resizeSpy).toHaveBeenCalledWith(file, {
        size: 200,
        format: 'image/jpeg',
        quality: 0.7,
        anchor: 'top',
      });
    });
  });
});
