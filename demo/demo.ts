import { squareCropResize } from '../src/index';
import type { CropAnchor, OutputFormat } from '../src/index';

const fileInput = document.getElementById('image-input') as HTMLInputElement;
const sizeInput = document.getElementById('size-input') as HTMLInputElement;
const formatSelect = document.getElementById('format-select') as HTMLSelectElement;
const qualityInput = document.getElementById('quality-input') as HTMLInputElement;
const qualityValue = document.getElementById('quality-value') as HTMLSpanElement;
const anchorSelect = document.getElementById('anchor-select') as HTMLSelectElement;
const originalPreview = document.getElementById('original-preview') as HTMLImageElement;
const resultPreview = document.getElementById('result-preview') as HTMLImageElement;
const info = document.getElementById('info') as HTMLDivElement;
const downloadBtn = document.getElementById('download-btn') as HTMLButtonElement;

let lastBlob: Blob | null = null;
let lastFormat: OutputFormat = 'image/png';

qualityInput.addEventListener('input', () => {
  qualityValue.textContent = qualityInput.value;
});

async function processFile(file: File) {
  const size = parseInt(sizeInput.value, 10) || 300;
  const format = formatSelect.value as OutputFormat;
  const quality = parseFloat(qualityInput.value);
  const anchor = anchorSelect.value as CropAnchor;

  originalPreview.src = URL.createObjectURL(file);

  const result = await squareCropResize(file, { size, format, quality, anchor });

  resultPreview.src = result.dataUrl;
  lastBlob = result.blob;
  lastFormat = result.format;
  downloadBtn.disabled = false;

  const ext = format.split('/')[1];
  info.textContent = `${result.size}x${result.size} ${ext.toUpperCase()} — ${(result.blob.size / 1024).toFixed(1)} KB`;
}

fileInput.addEventListener('change', () => {
  const file = fileInput.files?.[0];
  if (!file) return;
  processFile(file);
});

// Re-process when options change
for (const el of [sizeInput, formatSelect, qualityInput, anchorSelect]) {
  el.addEventListener('change', () => {
    const file = fileInput.files?.[0];
    if (file) processFile(file);
  });
}

downloadBtn.addEventListener('click', () => {
  if (!lastBlob) return;
  const ext = lastFormat.split('/')[1];
  const url = URL.createObjectURL(lastBlob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `square.${ext}`;
  a.click();
  URL.revokeObjectURL(url);
});
