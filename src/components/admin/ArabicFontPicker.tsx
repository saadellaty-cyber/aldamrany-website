'use client';

import { useState } from 'react';
import { Check } from 'lucide-react';
import {
  ARABIC_FONT_INFO,
  ARABIC_FONT_KEYS,
  DEFAULT_ARABIC_FONT,
  isArabicFontKey,
  type ArabicFontKey,
} from '@/lib/fonts-catalog';
import { cn } from '@/lib/utils';

/**
 * Chooses the Arabic typeface for the public site.
 *
 * Each option previews itself in its own face, using the same headline the
 * homepage uses — the only way to judge a typeface is to read real words set
 * in it. The preview loads the face from Google Fonts directly rather than
 * through next/font, because next/font is build-time and this is a live
 * preview of ten faces at once; the public site itself always uses the
 * self-hosted next/font copy.
 */
const SAMPLE_HEADING = 'خبرة تتجدد، وقدرات تتطور.';
const SAMPLE_BODY = 'خبرة متراكمة في تنفيذ مشروعات الطرق والرصف والبنية التحتية.';

const PREVIEW_HREF =
  'https://fonts.googleapis.com/css2?' +
  ARABIC_FONT_KEYS.map(
    (key) => `family=${ARABIC_FONT_INFO[key].cssName.replace(/ /g, '+')}:wght@400;600`,
  ).join('&') +
  '&display=swap';

export function ArabicFontPicker({
  name,
  initial,
  locale = 'ar',
}: {
  name: string;
  initial?: string | null;
  locale?: 'ar' | 'en';
}) {
  const [selected, setSelected] = useState<ArabicFontKey>(
    isArabicFontKey(initial) ? initial : DEFAULT_ARABIC_FONT,
  );

  return (
    <div>
      {/* Admin-only: the ten faces are needed together for the live preview. */}
      <link rel="stylesheet" href={PREVIEW_HREF} />

      <input type="hidden" name={name} value={selected} />

      <ul className="grid gap-2.5 md:grid-cols-2">
        {ARABIC_FONT_KEYS.map((key) => {
          const info = ARABIC_FONT_INFO[key];
          const active = key === selected;

          return (
            <li key={key}>
              <button
                type="button"
                onClick={() => setSelected(key)}
                aria-pressed={active}
                className={cn(
                  'w-full border p-4 text-start transition-colors',
                  active
                    ? 'border-ink bg-[#faf9f7]'
                    : 'border-[#e2e1dc] bg-white hover:border-ink/40',
                )}
              >
                <span className="flex items-center justify-between gap-3">
                  <span className="text-xs font-semibold">
                    {locale === 'ar' ? info.name : info.nameEn}
                    <span className="ms-2 font-normal text-ink-muted">
                      {locale === 'ar' ? info.nameEn : info.name}
                    </span>
                  </span>
                  {active ? (
                    <span className="inline-flex size-5 shrink-0 items-center justify-center bg-ink text-paper">
                      <Check className="size-3" aria-hidden="true" />
                    </span>
                  ) : null}
                </span>

                <span
                  dir="rtl"
                  className="mt-3 block text-[1.35rem] leading-[1.7]"
                  style={{ fontFamily: `'${info.cssName}', sans-serif`, fontWeight: 600 }}
                >
                  {SAMPLE_HEADING}
                </span>

                <span
                  dir="rtl"
                  className="mt-1.5 block text-[0.8125rem] leading-[1.9] text-ink-muted"
                  style={{ fontFamily: `'${info.cssName}', sans-serif` }}
                >
                  {SAMPLE_BODY}
                </span>

                <span className="mt-3 block text-[0.6875rem] leading-relaxed text-ink-muted">
                  {locale === 'ar' ? info.ar : info.en}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
