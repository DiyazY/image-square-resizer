# Changelog

## 2.0.0

Complete rewrite with modern tooling and API.

### Breaking changes

- Removed `imageSqResizer` class. Use the `squareCropResize()` function instead.
- Library is now Promise-based instead of callback/mutation-based.
- No longer coupled to a file input element. Pass a `File`, `Blob`, or `HTMLImageElement` directly.

### New features

- **Promise-based API**: `const result = await squareCropResize(file, options)`
- **Output format control**: PNG, JPEG, or WebP
- **Quality setting**: 0-1 for JPEG and WebP
- **Crop anchor**: 9 anchor points (center, top, bottom, left, right, and corners)
- **TypeScript**: Full type definitions included
- **Tree-shakeable**: ESM + CJS dual exports, `sideEffects: false`
- **Optional DOM binding**: `bindFileInput()` for convenience, tree-shaken when unused

### Bug fixes

- Fixed missing `return` that caused double-processing of small images
- Fixed race condition where `blob` was `null` when accessed after processing
- Fixed double `toDataURL()` call that wasted CPU
- Uses efficient `URL.createObjectURL()` instead of `FileReader.readAsDataURL()`

### Tooling

- Replaced Webpack 3 + Babel 6 with tsup + TypeScript
- Added vitest test suite (27 tests)
- Added interactive demo page served via Vite

## 1.0.0

Initial release. Class-based API with Webpack 3 + Babel 6 tooling.
