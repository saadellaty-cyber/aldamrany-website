/**
 * The Arabic typefaces offered in the dashboard — names, descriptions and keys.
 *
 * Deliberately free of any `next/font` import: the dashboard's font picker is a
 * client component and needs this catalogue, while the font loaders themselves
 * may only run on the server. `src/lib/fonts.ts` holds those.
 */
export const ARABIC_FONT_KEYS = [
  'cairo',
  'tajawal',
  'almarai',
  'readex',
  'alexandria',
  'plex',
  'changa',
  'messiri',
  'kufi',
  'amiri',
] as const;

export type ArabicFontKey = (typeof ARABIC_FONT_KEYS)[number];

export const DEFAULT_ARABIC_FONT: ArabicFontKey = 'cairo';

export function isArabicFontKey(value: unknown): value is ArabicFontKey {
  return typeof value === 'string' && (ARABIC_FONT_KEYS as readonly string[]).includes(value);
}
/**
 * Descriptions for the dashboard picker. Kept plain and honest so the choice
 * is made on how a face reads, not on marketing adjectives.
 */
export const ARABIC_FONT_INFO: Record<
  ArabicFontKey,
  { name: string; nameEn: string; ar: string; en: string; cssName: string }
> = {
  cairo: {
    name: 'القاهرة',
    nameEn: 'Cairo',
    ar: 'متوازن وحديث، يصلح للعناوين والنصوص معًا. الاختيار الافتراضي.',
    en: 'Balanced and modern, works for both headings and body. The default.',
    cssName: 'Cairo',
  },
  tajawal: {
    name: 'تجوّل',
    nameEn: 'Tajawal',
    ar: 'هندسي ونظيف، حروفه واسعة ومريحة في القراءة الطويلة.',
    en: 'Geometric and clean, with open letterforms that suit long reading.',
    cssName: 'Tajawal',
  },
  almarai: {
    name: 'المرعى',
    nameEn: 'Almarai',
    ar: 'بسيط ومؤسسي، خالٍ من الزخرفة — مناسب جدًا لمواقع الشركات.',
    en: 'Plain and corporate, free of ornament — a natural fit for company sites.',
    cssName: 'Almarai',
  },
  readex: {
    name: 'ريدكس برو',
    nameEn: 'Readex Pro',
    ar: 'مصمّم خصيصًا لأعلى وضوح ممكن. الأفضل لو الأولوية سهولة القراءة.',
    en: 'Designed specifically for maximum clarity. Best if legibility comes first.',
    cssName: 'Readex Pro',
  },
  alexandria: {
    name: 'الإسكندرية',
    nameEn: 'Alexandria',
    ar: 'معاصر ومحايد، بحروف واضحة ومتماسكة.',
    en: 'Contemporary and neutral, with clear, even letterforms.',
    cssName: 'Alexandria',
  },
  plex: {
    name: 'آي بي إم بلكس',
    nameEn: 'IBM Plex Sans Arabic',
    ar: 'تقني ودقيق، طابع هندسي جاد.',
    en: 'Technical and precise, with a serious engineering character.',
    cssName: 'IBM Plex Sans Arabic',
  },
  changa: {
    name: 'تشانجا',
    nameEn: 'Changa',
    ar: 'كوفي حديث بحروف مضغوطة — قوي في العناوين الكبيرة.',
    en: 'A modern kufi with condensed letterforms — strong at large sizes.',
    cssName: 'Changa',
  },
  messiri: {
    name: 'المصيري',
    nameEn: 'El Messiri',
    ar: 'أنيق ومميّز، له شخصية واضحة تفرّق الموقع عن غيره.',
    en: 'Elegant and distinctive, with a character that sets the site apart.',
    cssName: 'El Messiri',
  },
  kufi: {
    name: 'نوتو كوفي',
    nameEn: 'Noto Kufi Arabic',
    ar: 'كوفي هندسي صارم، حضور قوي في العناوين.',
    en: 'A strict geometric kufi with a strong presence in headings.',
    cssName: 'Noto Kufi Arabic',
  },
  amiri: {
    name: 'أميري',
    nameEn: 'Amiri',
    ar: 'نسخ كلاسيكي بطابع تقليدي عريق. الأنسب لو أردت طابعًا تراثيًا.',
    en: 'A classical naskh with a traditional, established feel.',
    cssName: 'Amiri',
  },
};
