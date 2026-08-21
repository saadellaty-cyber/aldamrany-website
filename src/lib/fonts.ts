import {
  Almarai,
  Amiri,
  Alexandria,
  Cairo,
  Changa,
  El_Messiri,
  IBM_Plex_Sans_Arabic,
  Noto_Kufi_Arabic,
  Readex_Pro,
  Tajawal,
} from 'next/font/google';
import { DEFAULT_ARABIC_FONT, isArabicFontKey, type ArabicFontKey } from '@/lib/fonts-catalog';

/**
 * Loads the ten Arabic typefaces offered in the dashboard.
 *
 * All ten declare the same CSS variable, and only the selected one's class is
 * applied to <html> — so exactly one typeface is ever in play, and the rest
 * cost nothing beyond a few unused @font-face rules. `preload` is off for the
 * same reason: which face is needed is a database value, not a build-time one,
 * so preloading all ten would download ten fonts to use one.
 *
 * The repetition below is not accidental. next/font requires each loader to be
 * called at module scope and assigned to its own const, with every option
 * written as a literal — no shared constants, no spread.
 */

const cairo = Cairo({
  subsets: ['arabic', 'latin'],
  variable: '--font-arabic',
  display: 'swap',
  preload: false,
  weight: ['300', '400', '500', '600', '700'],
});

const tajawal = Tajawal({
  subsets: ['arabic', 'latin'],
  variable: '--font-arabic',
  display: 'swap',
  preload: false,
  weight: ['300', '400', '500', '700'],
});

const almarai = Almarai({
  subsets: ['arabic', 'latin'],
  variable: '--font-arabic',
  display: 'swap',
  preload: false,
  weight: ['300', '400', '700'],
});

const readex = Readex_Pro({
  subsets: ['arabic', 'latin'],
  variable: '--font-arabic',
  display: 'swap',
  preload: false,
  weight: ['300', '400', '500', '600', '700'],
});

const alexandria = Alexandria({
  subsets: ['arabic', 'latin'],
  variable: '--font-arabic',
  display: 'swap',
  preload: false,
  weight: ['300', '400', '500', '600', '700'],
});

const plex = IBM_Plex_Sans_Arabic({
  subsets: ['arabic', 'latin'],
  variable: '--font-arabic',
  display: 'swap',
  preload: false,
  weight: ['300', '400', '500', '600', '700'],
});

const changa = Changa({
  subsets: ['arabic', 'latin'],
  variable: '--font-arabic',
  display: 'swap',
  preload: false,
  weight: ['300', '400', '500', '600', '700'],
});

const messiri = El_Messiri({
  subsets: ['arabic', 'latin'],
  variable: '--font-arabic',
  display: 'swap',
  preload: false,
  weight: ['400', '500', '600', '700'],
});

const kufi = Noto_Kufi_Arabic({
  subsets: ['arabic', 'latin'],
  variable: '--font-arabic',
  display: 'swap',
  preload: false,
  weight: ['300', '400', '500', '600', '700'],
});

const amiri = Amiri({
  subsets: ['arabic', 'latin'],
  variable: '--font-arabic',
  display: 'swap',
  preload: false,
  weight: ['400', '700'],
});

const faces: Record<ArabicFontKey, { variable: string }> = {
  cairo,
  tajawal,
  almarai,
  readex,
  alexandria,
  plex,
  changa,
  messiri,
  kufi,
  amiri,
};

/** The class that defines `--font-arabic` for the chosen typeface. */
export function arabicFontClass(key: string | null | undefined): string {
  return faces[isArabicFontKey(key) ? key : DEFAULT_ARABIC_FONT].variable;
}

export {
  ARABIC_FONT_INFO,
  ARABIC_FONT_KEYS,
  DEFAULT_ARABIC_FONT,
  isArabicFontKey,
  type ArabicFontKey,
} from '@/lib/fonts-catalog';
