# image-square-resizer

Crop and resize images to squares. Zero dependencies, browser-native, Promise-based.

## Install

```bash
npm install image-square-resizer
```

## Usage

```ts
import { squareCropResize } from 'image-square-resizer';

const file = inputElement.files[0];
const result = await squareCropResize(file, { size: 300 });

// Use the result
document.getElementById('preview').src = result.dataUrl;

const formData = new FormData();
formData.append('avatar', result.blob, 'avatar.png');
```

### Options

```ts
await squareCropResize(file, {
  size: 200,               // Target square size in px (default: shorter dimension)
  format: 'image/webp',    // 'image/png' | 'image/jpeg' | 'image/webp' (default: 'image/png')
  quality: 0.8,            // 0-1, for JPEG/WebP (default: 0.92)
  anchor: 'top',           // Crop anchor point (default: 'center')
});
```

**Anchor points:** `center`, `top`, `bottom`, `left`, `right`, `top-left`, `top-right`, `bottom-left`, `bottom-right`

### Result

```ts
interface ResizeResult {
  blob: Blob;          // Ready for FormData upload
  dataUrl: string;     // Ready for img.src
  size: number;        // Final square edge size
  format: OutputFormat;
}
```

### Input types

Accepts `File`, `Blob`, or `HTMLImageElement`:

```ts
// From file input
await squareCropResize(file, { size: 300 });

// From blob
await squareCropResize(blob, { size: 300 });

// From existing image element
await squareCropResize(imgElement, { size: 300 });
```

### DOM file input binding (optional)

```ts
import { bindFileInput } from 'image-square-resizer';

const cleanup = bindFileInput(document.getElementById('avatar-input'), {
  size: 300,
  format: 'image/jpeg',
  quality: 0.85,
  onResult: (result) => {
    preview.src = result.dataUrl;
  },
  onError: (err) => console.error(err),
});

// Remove listener when done
cleanup();
```

## How it works

1. Crops the image to a square using the shorter dimension
2. Resizes to the target size (never upscales)

The crop anchor controls which part of the image is kept. For example, `top` keeps the top of a portrait photo, `center` (default) keeps the middle.

## Development

```bash
npm install
npm run dev      # Serve demo at localhost:5173
npm test         # Run tests
npm run build    # Build ESM + CJS + types to dist/
```

## License

[MIT](./LICENSE)
