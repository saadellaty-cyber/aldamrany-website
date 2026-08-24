import { clsx, type ClassValue } from 'clsx';
import { extendTailwindMerge } from 'tailwind-merge';

/**
 * tailwind-merge has to be told about the project's custom colour names.
 * Without this it cannot tell `text-paper` (a colour) from `text-sm` (a size),
 * treats them as the same group, and silently drops one — which renders
 * buttons as black text on a black background.
 */
const CUSTOM_COLORS = [
  'ink',
  'ink-soft',
  'ink-raised',
  'ink-muted',
  'paper',
  'paper-soft',
  'paper-dim',
  'line',
  'line-dark',
  'brass',
  'brass-dim',
  'night',
  'night-soft',
  'night-raised',
  'night-line',
  'cream',
  'gold',
  'gold-soft',
  'gold-dim',
  'gold-calm',
  'yellow',
  'danger',
  'success',
  'warning',
];

const twMerge = extendTailwindMerge({
  extend: {
    theme: { color: CUSTOM_COLORS },
  },
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * URL-safe slug that keeps Arabic letters intact (browsers percent-encode
 * them, and search engines handle them fine) while normalising everything else.
 */
export function slugify(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/[ً-ٰٟ]/g, '') // Arabic diacritics
    .replace(/[^\p{Letter}\p{Number}]+/gu, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 90);
}

/** Digits only, suitable for wa.me and tel: links. */
export function normalizePhone(value: string): string {
  return value.replace(/[^\d]/g, '');
}

export function whatsappLink(number: string | null | undefined, message?: string | null): string | null {
  if (!number) return null;
  const digits = normalizePhone(number);
  if (digits.length < 8) return null;
  const query = message?.trim() ? `?text=${encodeURIComponent(message.trim())}` : '';
  return `https://wa.me/${digits}${query}`;
}

export function telLink(value: string | null | undefined): string | null {
  if (!value) return null;
  const cleaned = value.replace(/[^\d+]/g, '');
  return cleaned.length >= 6 ? `tel:${cleaned}` : null;
}

export function mailtoLink(value: string | null | undefined): string | null {
  if (!value?.includes('@')) return null;
  return `mailto:${value.trim()}`;
}

/** CSS `object-position` string from stored focal-point percentages. */
export function focalPosition(x: number | null | undefined, y: number | null | undefined): string {
  const clamp = (value: number | null | undefined) =>
    Math.min(100, Math.max(0, typeof value === 'number' && Number.isFinite(value) ? value : 50));
  return `${clamp(x)}% ${clamp(y)}%`;
}

/** Trims a string and returns null when nothing meaningful remains. */
export function blankToNull(value: string | null | undefined): string | null {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function formatDate(date: Date | string, locale: string): string {
  const value = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat(locale === 'ar' ? 'ar-EG' : 'en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(value);
}

export function formatDateTime(date: Date | string, locale: string): string {
  const value = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat(locale === 'ar' ? 'ar-EG' : 'en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(value);
}

/** Splits prose stored in a textarea into paragraphs. */
export function toParagraphs(value: string | null | undefined): string[] {
  if (!value) return [];
  return value
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
}

/** Splits a textarea into single lines, e.g. for bullet lists. */
export function toLines(value: string | null | undefined): string[] {
  if (!value) return [];
  return value
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
}

export function absoluteUrl(siteUrl: string, path: string): string {
  return `${siteUrl.replace(/\/+$/, '')}${path.startsWith('/') ? path : `/${path}`}`;
}
