export type OutputFormat = 'image/png' | 'image/jpeg' | 'image/webp';

export type CropAnchor =
  | 'center'
  | 'top'
  | 'bottom'
  | 'left'
  | 'right'
  | 'top-left'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-right';

export interface ResizeOptions {
  /** Target square edge size in pixels. If omitted, uses the shorter dimension. */
  size?: number;
  /** Output image format. Default: 'image/png' */
  format?: OutputFormat;
  /** Output quality 0-1. Only applies to JPEG and WebP. Default: 0.92 */
  quality?: number;
  /** Which part of the image to anchor when cropping. Default: 'center' */
  anchor?: CropAnchor;
}

export interface ResizeResult {
  /** The resized image as a Blob */
  blob: Blob;
  /** The resized image as a data URL string */
  dataUrl: string;
  /** The final square edge size in pixels */
  size: number;
  /** The output format used */
  format: OutputFormat;
}
