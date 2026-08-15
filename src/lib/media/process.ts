import { randomBytes } from 'node:crypto';
import sharp from 'sharp';
import { env } from '@/lib/env';

/**
 * Upload validation and normalisation.
 *
 * Trust nothing the browser sends: the declared MIME type is ignored in favour
 * of magic-byte sniffing, filenames are regenerated, rasters are re-encoded
 * (which also strips EXIF), and SVG is sanitised before it is ever stored.
 */

export type ImageFormat = 'jpeg' | 'png' | 'webp' | 'avif' | 'svg';

const FORMAT_META: Record<ImageFormat, { mime: string; extension: string }> = {
  jpeg: { mime: 'image/jpeg', extension: 'jpg' },
  png: { mime: 'image/png', extension: 'png' },
  webp: { mime: 'image/webp', extension: 'webp' },
  avif: { mime: 'image/avif', extension: 'avif' },
  svg: { mime: 'image/svg+xml', extension: 'svg' },
};

export const ACCEPTED_MIME_TYPES = Object.values(FORMAT_META).map((f) => f.mime);

/** Longest edge kept in storage; next/image derives smaller sizes on demand. */
const MAX_DIMENSION = 2800;

export class UploadError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'UploadError';
  }
}

/** Identifies the real format from the file's leading bytes. */
function sniffFormat(buffer: Buffer): ImageFormat | null {
  if (buffer.length < 12) return null;

  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) return 'jpeg';

  if (
    buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47 &&
    buffer[4] === 0x0d && buffer[5] === 0x0a && buffer[6] === 0x1a && buffer[7] === 0x0a
  ) {
    return 'png';
  }

  if (buffer.toString('ascii', 0, 4) === 'RIFF' && buffer.toString('ascii', 8, 12) === 'WEBP') {
    return 'webp';
  }

  if (buffer.toString('ascii', 4, 8) === 'ftyp') {
    const brand = buffer.toString('ascii', 8, 12);
    if (brand === 'avif' || brand === 'avis') return 'avif';
  }

  // SVG is text; check the opening markup of the first chunk.
  const head = buffer.subarray(0, 1024).toString('utf8').trimStart().toLowerCase();
  if (head.startsWith('<svg') || (head.startsWith('<?xml') && head.includes('<svg'))) return 'svg';

  return null;
}

/**
 * Conservative SVG sanitiser: removes script-capable elements, event handler
 * attributes, external/script URLs and DOCTYPE entity declarations.
 * Combined with the sandboxed CSP used when serving SVG, this prevents an
 * uploaded logo from executing script in the site's origin.
 */
export function sanitizeSvg(source: string): string {
  let svg = source;

  // Entity declarations enable billion-laughs style expansion attacks.
  svg = svg.replace(/<!DOCTYPE[\s\S]*?>/gi, '');
  svg = svg.replace(/<!ENTITY[\s\S]*?>/gi, '');

  // Elements that can execute or embed arbitrary content.
  const forbiddenElements = [
    'script', 'foreignObject', 'iframe', 'embed', 'object', 'audio', 'video',
    'animate', 'animateTransform', 'animateMotion', 'set', 'handler',
  ];
  for (const element of forbiddenElements) {
    svg = svg.replace(new RegExp(`<${element}\\b[\\s\\S]*?</${element}\\s*>`, 'gi'), '');
    svg = svg.replace(new RegExp(`<${element}\\b[^>]*/?>`, 'gi'), '');
  }

  // Inline event handlers: on*="...".
  svg = svg.replace(/\son[a-z]+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, '');

  // Script and external references in href/xlink:href/src/data.
  svg = svg.replace(
    /\s(?:xlink:href|href|src|data)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/gi,
    (match, dq, sq, bare) => {
      const value = String(dq ?? sq ?? bare ?? '').trim().toLowerCase();
      const safe = value.startsWith('#') || value.startsWith('data:image/');
      return safe ? match : '';
    },
  );

  // url(javascript:…) inside style attributes and <style> blocks.
  svg = svg.replace(/javascript\s*:/gi, '');

  return svg.trim();
}

function safeBaseName(originalName: string): string {
  const withoutExtension = originalName.replace(/\.[^./\\]+$/, '');
  const slug = withoutExtension
    .normalize('NFKD')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
  return slug || 'image';
}

/** `media/2026/08/a1b2c3d4-project-photo.webp` — unguessable and collision-free. */
export function buildStorageKey(originalName: string, extension: string): string {
  const now = new Date();
  const year = now.getUTCFullYear();
  const month = String(now.getUTCMonth() + 1).padStart(2, '0');
  return `media/${year}/${month}/${randomBytes(8).toString('hex')}-${safeBaseName(originalName)}.${extension}`;
}

export type ProcessedUpload = {
  buffer: Buffer;
  mimeType: string;
  extension: string;
  format: ImageFormat;
  width: number | null;
  height: number | null;
  blurDataUrl: string | null;
};

/**
 * Validates and normalises an uploaded file, returning the bytes that should
 * be written to storage together with the metadata to persist.
 */
export async function processUpload(input: Buffer): Promise<ProcessedUpload> {
  if (input.length === 0) throw new UploadError('The file is empty.');
  if (input.length > env.maxUploadBytes) {
    throw new UploadError(
      `File is larger than the ${Math.round(env.maxUploadBytes / (1024 * 1024))} MB limit.`,
    );
  }

  const format = sniffFormat(input);
  if (!format) {
    throw new UploadError('Unsupported file type. Upload a JPEG, PNG, WebP, AVIF or SVG image.');
  }

  if (format === 'svg') {
    const sanitized = sanitizeSvg(input.toString('utf8'));
    if (!sanitized.toLowerCase().includes('<svg')) {
      throw new UploadError('The SVG file could not be sanitised safely.');
    }
    const buffer = Buffer.from(sanitized, 'utf8');
    const { width, height } = await readSvgDimensions(buffer);
    return {
      buffer,
      mimeType: FORMAT_META.svg.mime,
      extension: FORMAT_META.svg.extension,
      format,
      width,
      height,
      blurDataUrl: null,
    };
  }

  let pipeline = sharp(input, { failOn: 'error' }).rotate();
  const metadata = await pipeline.metadata().catch(() => {
    throw new UploadError('The image could not be read. It may be corrupt.');
  });

  const needsResize =
    (metadata.width ?? 0) > MAX_DIMENSION || (metadata.height ?? 0) > MAX_DIMENSION;
  if (needsResize) {
    pipeline = pipeline.resize({
      width: MAX_DIMENSION,
      height: MAX_DIMENSION,
      fit: 'inside',
      withoutEnlargement: true,
    });
  }

  // Re-encoding normalises orientation and drops EXIF (including GPS data).
  switch (format) {
    case 'jpeg':
      pipeline = pipeline.jpeg({ quality: 82, mozjpeg: true });
      break;
    case 'png':
      pipeline = pipeline.png({ compressionLevel: 9 });
      break;
    case 'webp':
      pipeline = pipeline.webp({ quality: 82 });
      break;
    case 'avif':
      pipeline = pipeline.avif({ quality: 55 });
      break;
  }

  const { data, info } = await pipeline.toBuffer({ resolveWithObject: true });

  return {
    buffer: data,
    mimeType: FORMAT_META[format].mime,
    extension: FORMAT_META[format].extension,
    format,
    width: info.width,
    height: info.height,
    blurDataUrl: await makeBlurDataUrl(data),
  };
}

/** Tiny inline preview used as the `blurDataURL` for next/image. */
async function makeBlurDataUrl(buffer: Buffer): Promise<string | null> {
  try {
    const small = await sharp(buffer)
      .resize(16, 16, { fit: 'inside' })
      .webp({ quality: 40 })
      .toBuffer();
    return `data:image/webp;base64,${small.toString('base64')}`;
  } catch {
    return null;
  }
}

async function readSvgDimensions(buffer: Buffer): Promise<{ width: number | null; height: number | null }> {
  try {
    const metadata = await sharp(buffer).metadata();
    return { width: metadata.width ?? null, height: metadata.height ?? null };
  } catch {
    const text = buffer.toString('utf8', 0, 2048);
    const viewBox = /viewBox\s*=\s*["']\s*[\d.-]+\s+[\d.-]+\s+([\d.]+)\s+([\d.]+)/i.exec(text);
    if (viewBox) {
      return { width: Math.round(Number(viewBox[1])), height: Math.round(Number(viewBox[2])) };
    }
    return { width: null, height: null };
  }
}
