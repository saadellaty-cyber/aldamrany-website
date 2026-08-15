'use client';

import { useCallback, useRef, useState } from 'react';
import { Monitor, RotateCcw, Smartphone } from 'lucide-react';
import { cn } from '@/lib/utils';

export type FocalValues = {
  focalX: number;
  focalY: number;
  mobileFocalX: number;
  mobileFocalY: number;
};

const DEFAULTS: FocalValues = { focalX: 50, focalY: 50, mobileFocalX: 50, mobileFocalY: 50 };

const clamp = (value: number) => Math.min(100, Math.max(0, Math.round(value * 10) / 10));

/**
 * Visual focal-point picker.
 *
 * The source image is never cropped. Instead the chosen point is stored as a
 * percentage and applied as CSS `object-position`, with an independent point
 * for narrow screens where the crop is much tighter. Values are mirrored into
 * hidden inputs so the editor drops straight into an ordinary form.
 */
export function FocalPointEditor({
  imageUrl,
  alt = '',
  initial,
  namePrefix = '',
  onChange,
}: {
  imageUrl: string;
  alt?: string;
  initial?: Partial<FocalValues>;
  /** Prefixes the hidden input names, e.g. "hero" → "heroFocalX". */
  namePrefix?: string;
  onChange?: (values: FocalValues) => void;
}) {
  const [values, setValues] = useState<FocalValues>({
    focalX: initial?.focalX ?? DEFAULTS.focalX,
    focalY: initial?.focalY ?? DEFAULTS.focalY,
    mobileFocalX: initial?.mobileFocalX ?? DEFAULTS.mobileFocalX,
    mobileFocalY: initial?.mobileFocalY ?? DEFAULTS.mobileFocalY,
  });

  const [target, setTarget] = useState<'desktop' | 'mobile'>('desktop');
  const stageRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  const field = (name: string) => (namePrefix ? `${namePrefix}${name[0].toUpperCase()}${name.slice(1)}` : name);

  const update = useCallback(
    (next: Partial<FocalValues>) => {
      setValues((current) => {
        const merged = { ...current, ...next };
        onChange?.(merged);
        return merged;
      });
    },
    [onChange],
  );

  const setFromPointer = useCallback(
    (clientX: number, clientY: number) => {
      const stage = stageRef.current;
      if (!stage) return;

      const rect = stage.getBoundingClientRect();
      const x = clamp(((clientX - rect.left) / rect.width) * 100);
      const y = clamp(((clientY - rect.top) / rect.height) * 100);

      update(target === 'desktop' ? { focalX: x, focalY: y } : { mobileFocalX: x, mobileFocalY: y });
    },
    [target, update],
  );

  const activeX = target === 'desktop' ? values.focalX : values.mobileFocalX;
  const activeY = target === 'desktop' ? values.focalY : values.mobileFocalY;

  return (
    <div className="space-y-4">
      {/* Hidden inputs keep this usable inside a plain <form>. */}
      <input type="hidden" name={field('focalX')} value={values.focalX} />
      <input type="hidden" name={field('focalY')} value={values.focalY} />
      <input type="hidden" name={field('mobileFocalX')} value={values.mobileFocalX} />
      <input type="hidden" name={field('mobileFocalY')} value={values.mobileFocalY} />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div
          className="inline-flex border border-[#d5d4ce]"
          role="group"
          aria-label="Focal point being edited"
        >
          {(['desktop', 'mobile'] as const).map((option) => {
            const Icon = option === 'desktop' ? Monitor : Smartphone;
            return (
              <button
                key={option}
                type="button"
                onClick={() => setTarget(option)}
                aria-pressed={target === option}
                className={cn(
                  'inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-colors',
                  target === option ? 'bg-ink text-paper' : 'bg-white hover:bg-[#f2f1ee]',
                )}
              >
                <Icon className="size-3.5" aria-hidden="true" />
                {option === 'desktop' ? 'Desktop' : 'Mobile'}
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={() => update(DEFAULTS)}
          className="inline-flex items-center gap-1.5 text-xs text-ink-muted transition-colors hover:text-ink"
        >
          <RotateCcw className="size-3.5" aria-hidden="true" />
          Reset to centre
        </button>
      </div>

      {/* Drag stage */}
      <div
        ref={stageRef}
        role="application"
        aria-label={`Drag to set the ${target} focal point`}
        onPointerDown={(event) => {
          dragging.current = true;
          event.currentTarget.setPointerCapture(event.pointerId);
          setFromPointer(event.clientX, event.clientY);
        }}
        onPointerMove={(event) => {
          if (dragging.current) setFromPointer(event.clientX, event.clientY);
        }}
        onPointerUp={(event) => {
          dragging.current = false;
          event.currentTarget.releasePointerCapture(event.pointerId);
        }}
        className="relative w-full cursor-crosshair touch-none select-none overflow-hidden border border-[#d5d4ce] bg-[#f2f1ee]"
        style={{ aspectRatio: '16 / 9' }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- editor needs the untransformed source */}
        <img
          src={imageUrl}
          alt={alt}
          draggable={false}
          className="absolute inset-0 h-full w-full object-contain"
        />

        <span
          aria-hidden="true"
          className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-1/2"
          style={{ left: `${activeX}%`, top: `${activeY}%` }}
        >
          <span className="block size-7 rounded-full border-2 border-white shadow-[0_0_0_1px_rgba(0,0,0,0.55)]">
            <span className="absolute left-1/2 top-1/2 block size-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white" />
          </span>
        </span>
      </div>

      {/* Numeric control */}
      <div className="grid gap-4 sm:grid-cols-2">
        <RangeControl
          label={`${target === 'desktop' ? 'Desktop' : 'Mobile'} horizontal`}
          value={activeX}
          onChange={(value) =>
            update(target === 'desktop' ? { focalX: value } : { mobileFocalX: value })
          }
        />
        <RangeControl
          label={`${target === 'desktop' ? 'Desktop' : 'Mobile'} vertical`}
          value={activeY}
          onChange={(value) =>
            update(target === 'desktop' ? { focalY: value } : { mobileFocalY: value })
          }
        />
      </div>

      {/* Live crop previews */}
      <div>
        <p className="mb-2 text-xs font-medium text-ink-muted">
          How the image will be cropped on the site
        </p>
        <div className="grid gap-3 sm:grid-cols-[2fr_1fr]">
          <CropPreview
            title="Desktop — wide banner"
            imageUrl={imageUrl}
            alt={alt}
            position={`${values.focalX}% ${values.focalY}%`}
            ratio="16 / 9"
            active={target === 'desktop'}
          />
          <CropPreview
            title="Mobile — tall crop"
            imageUrl={imageUrl}
            alt={alt}
            position={`${values.mobileFocalX}% ${values.mobileFocalY}%`}
            ratio="4 / 5"
            active={target === 'mobile'}
          />
        </div>
      </div>
    </div>
  );
}

function RangeControl({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 flex items-baseline justify-between text-xs font-medium">
        {label}
        <span className="tabular-nums text-ink-muted">{value}%</span>
      </span>
      <input
        type="range"
        min={0}
        max={100}
        step={0.5}
        value={value}
        onChange={(event) => onChange(clamp(Number(event.target.value)))}
        className="w-full accent-[var(--color-ink)]"
      />
    </label>
  );
}

function CropPreview({
  title,
  imageUrl,
  alt,
  position,
  ratio,
  active,
}: {
  title: string;
  imageUrl: string;
  alt: string;
  position: string;
  ratio: string;
  active: boolean;
}) {
  return (
    <figure>
      <div
        className={cn(
          'relative w-full overflow-hidden border bg-[#f2f1ee] transition-colors',
          active ? 'border-ink' : 'border-[#e2e1dc]',
        )}
        style={{ aspectRatio: ratio }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- preview mirrors raw CSS behaviour */}
        <img
          src={imageUrl}
          alt={alt}
          draggable={false}
          className="absolute inset-0 h-full w-full object-cover"
          style={{ objectPosition: position }}
        />
      </div>
      <figcaption className="mt-1.5 text-[0.6875rem] text-ink-muted">{title}</figcaption>
    </figure>
  );
}
