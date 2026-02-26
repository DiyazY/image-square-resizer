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
const originalInfo = document.getElementById('original-info') as HTMLSpanElement;
const resultInfo = document.getElementById('result-info') as HTMLSpanElement;
const reprocessBtn = document.getElementById('reprocess-btn') as HTMLButtonElement;
const downloadBtn = document.getElementById('download-btn') as HTMLButtonElement;

let lastBlob: Blob | null = null;
let lastFormat: OutputFormat = 'image/png';

function updateQualityState() {
  const isLossy = formatSelect.value !== 'image/png';
  qualityInput.disabled = !isLossy;
  qualityValue.textContent = isLossy
    ? qualityInput.value
    : 'n/a (PNG is lossless)';
}

qualityInput.addEventListener('input', () => {
  qualityValue.textContent = qualityInput.value;
});

formatSelect.addEventListener('change', updateQualityState);
updateQualityState();

async function processFile(file: File) {
  const size = parseInt(sizeInput.value, 10) || 300;
  const format = formatSelect.value as OutputFormat;
  const quality = parseFloat(qualityInput.value);
  const anchor = anchorSelect.value as CropAnchor;

  // Show loading state
  reprocessBtn.disabled = true;
  reprocessBtn.textContent = 'Processing...';
  resultPreview.style.opacity = '0.4';

  // Show original and wait for it to load so we can read its natural dimensions
  const originalUrl = URL.createObjectURL(file);
  originalPreview.src = originalUrl;
  preview.classList.remove('hidden');

  await new Promise<void>((resolve) => {
    originalPreview.onload = () => resolve();
    // If already cached, onload may not fire
    if (originalPreview.complete) resolve();
  });

  const origW = originalPreview.naturalWidth;
  const origH = originalPreview.naturalHeight;
  const fileSizeKB = (file.size / 1024).toFixed(1);
  originalInfo.textContent = `${origW}x${origH} — ${fileSizeKB} KB`;

  const result = await squareCropResize(file, { size, format, quality, anchor });

  resultPreview.src = result.dataUrl;
  resultPreview.style.opacity = '1';
  lastBlob = result.blob;
  lastFormat = result.format;
  downloadBtn.disabled = false;
  reprocessBtn.disabled = false;
  reprocessBtn.textContent = 'Re-process';

  const ext = format.split('/')[1];
  const resultSizeKB = (result.blob.size / 1024).toFixed(1);
  resultInfo.textContent = `${result.size}x${result.size} ${ext.toUpperCase()} — ${resultSizeKB} KB`;
}

function reprocess() {
  const file = fileInput.files?.[0];
  if (file) processFile(file);
}

// Process on file select
fileInput.addEventListener('change', reprocess);

// Re-process button for applying changed options
reprocessBtn.addEventListener('click', reprocess);

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
