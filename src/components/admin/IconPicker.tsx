'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { ICON_GLYPHS } from '@/components/ui/Icon';
import { ICON_KEYS, ICON_LABELS, isIconKey, type IconKey } from '@/lib/icons';
import { AdminButton } from '@/components/admin/ui';
import { cn } from '@/lib/utils';

/**
 * Chooses one icon from the curated set. The key is written to a hidden input,
 * so the picker drops into any form posted to a server action; an empty value
 * means "no icon", and the site then falls back to a sensible default for that
 * slug.
 */
export function IconPicker({
  name,
  label,
  description,
  initial,
}: {
  name: string;
  label: string;
  description?: string;
  initial?: string | null;
}) {
  const [selected, setSelected] = useState<IconKey | ''>(isIconKey(initial) ? initial : '');
  const Selected = selected ? ICON_GLYPHS[selected] : null;

  return (
    <div>
      <p className="mb-1.5 text-sm font-medium">{label}</p>
      {description ? (
        <p className="mb-2 text-xs leading-relaxed text-ink-muted">{description}</p>
      ) : null}

      <input type="hidden" name={name} value={selected} />

      <div className="flex items-start gap-3">
        <span className="flex size-14 shrink-0 items-center justify-center border border-[#d5d4ce] bg-white">
          {Selected ? (
            <Selected className="size-6 text-ink" strokeWidth={1.5} aria-hidden="true" />
          ) : (
            <span className="text-[0.625rem] text-ink-muted">none</span>
          )}
        </span>

        <div className="min-w-0 flex-1">
          <p className="text-xs text-ink-muted">
            {selected ? `${ICON_LABELS[selected].en} — ${ICON_LABELS[selected].ar}` : 'No icon selected'}
          </p>

          <div className="mt-2 flex flex-wrap gap-2">
            {selected ? (
              <AdminButton variant="ghost" onClick={() => setSelected('')}>
                <X className="size-3.5" aria-hidden="true" />
                Clear
              </AdminButton>
            ) : null}
          </div>
        </div>
      </div>

      {/* The set is small enough to show inline; a modal would be more clicks
          for no benefit. */}
      <ul className="scrollbar-thin mt-3 grid max-h-56 grid-cols-6 gap-1.5 overflow-y-auto border border-[#e2e1dc] bg-white p-2 sm:grid-cols-8 md:grid-cols-10">
        {ICON_KEYS.map((key) => {
          const Glyph = ICON_GLYPHS[key];
          const active = key === selected;
          return (
            <li key={key}>
              <button
                type="button"
                onClick={() => setSelected(active ? '' : key)}
                aria-pressed={active}
                title={`${ICON_LABELS[key].en} — ${ICON_LABELS[key].ar}`}
                className={cn(
                  'flex aspect-square w-full items-center justify-center border transition-colors',
                  active
                    ? 'border-ink bg-ink text-paper'
                    : 'border-transparent text-ink-muted hover:border-ink/40 hover:text-ink',
                )}
              >
                <Glyph className="size-4.5" strokeWidth={1.5} aria-hidden="true" />
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
