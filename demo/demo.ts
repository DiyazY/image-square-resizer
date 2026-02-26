import { squareCropResize } from '../src/index';
import type { CropAnchor, OutputFormat } from '../src/index';

const fileInput = document.getElementById('image-input') as HTMLInputElement;
const sizeInput = document.getElementById('size-input') as HTMLInputElement;
const formatSelect = document.getElementById('format-select') as HTMLSelectElement;
const qualityInput = document.getElementById('quality-input') as HTMLInputElement;
const qualityValue = document.getElementById('quality-value') as HTMLSpanElement;
const anchorSelect = document.getElementById('anchor-select') as HTMLSelectElement;
const preview = document.getElementById('preview') as HTMLDivElement;
const originalPreview = document.getElementById('original-preview') as HTMLImageElement;
const resultPreview = document.getElementById('result-preview') as HTMLImageElement;
const info = document.getElementById('info') as HTMLDivElement;
const reprocessBtn = document.getElementById('reprocess-btn') as HTMLButtonElement;
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

  // Show original
  originalPreview.src = URL.createObjectURL(file);
  preview.classList.remove('hidden');

  const result = await squareCropResize(file, { size, format, quality, anchor });

  resultPreview.src = result.dataUrl;
  lastBlob = result.blob;
  lastFormat = result.format;
  downloadBtn.disabled = false;
  reprocessBtn.disabled = false;

  const ext = format.split('/')[1];
  info.textContent = `${result.size}x${result.size} ${ext.toUpperCase()} — ${(result.blob.size / 1024).toFixed(1)} KB`;
}

function reprocess() {
  const file = fileInput.files?.[0];
  if (file) processFile(file);
}

// Process on file select
fileInput.addEventListener('change', reprocess);

// Re-process button
reprocessBtn.addEventListener('click', reprocess);

// Also re-process live when options change
for (const el of [formatSelect, anchorSelect]) {
  el.addEventListener('change', reprocess);
}
sizeInput.addEventListener('input', reprocess);
qualityInput.addEventListener('input', reprocess);

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
